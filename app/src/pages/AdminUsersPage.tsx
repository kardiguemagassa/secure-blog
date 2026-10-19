import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminKeys, changeUserRole, deleteUser, getUsers } from '../api/admin'
import { ApiError } from '../api/client'
import { postKeys } from '../api/posts'
import { useAuth } from '../auth/useAuth'
import { Pagination } from '../components/Pagination'
import { usePageParam } from '../hooks/usePageParam'
import type { Role, UserResponse } from '../types/api'
import styles from './AdminUsersPage.module.css'

const ROLE_LABELS: Record<Role, string> = {
  ROLE_USER: 'User',
  ROLE_ADMIN: 'Admin',
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = usePageParam()

  const { data, error, isPending, isPlaceholderData } = useQuery({
    queryKey: adminKeys.users(page),
    queryFn: () => getUsers(page - 1),
    placeholderData: keepPreviousData,
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => changeUserRole(id, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.all })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.all })
      void queryClient.invalidateQueries({ queryKey: postKeys.all }) // ses posts ont été supprimés avec lui
    },
  })

  function handleRoleChange(target: UserResponse, role: Role) {
    if (role === target.role) {
      return
    }
    const message =
      role === 'ROLE_ADMIN'
        ? `Give admin rights to ${target.username}?`
        : `Remove admin rights from ${target.username}?`
    if (window.confirm(message)) {
      roleMutation.mutate({ id: target.id, role })
    }
  }

  function handleDelete(target: UserResponse) {
    if (window.confirm(`Delete ${target.username} and all their posts? This cannot be undone.`)) {
      deleteMutation.mutate(target.id)
    }
  }

  const mutationError = roleMutation.error ?? deleteMutation.error

  return (
    <section>
      <h1>Users</h1>

      {mutationError && <p role="alert">{adminErrorMessage(mutationError)}</p>}
      {isPending && <p>Loading users…</p>}
      {error && <p role="alert">Could not load users.</p>}

      {data && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table} aria-busy={isPlaceholderData}>
              <thead>
                <tr>
                  <th scope="col">Username</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">
                    <span className={styles.visuallyHidden}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((row) => {
                  const isSelf = row.id === currentUser?.id
                  const isBusy =
                    (roleMutation.isPending && roleMutation.variables?.id === row.id) ||
                    (deleteMutation.isPending && deleteMutation.variables === row.id)

                  return (
                    <tr key={row.id}>
                      <td>
                        {row.username}
                        {isSelf && ' (you)'}
                      </td>
                      <td>{row.email}</td>
                      <td>
                        <select
                          aria-label={`Role of ${row.username}`}
                          value={row.role}
                          disabled={isSelf || isBusy}
                          onChange={(event) => handleRoleChange(row, event.target.value as Role)}
                        >
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.danger}
                          disabled={isSelf || isBusy}
                          onClick={() => handleDelete(row)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={data.page.totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  )
}

function adminErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    if (error.status === 409)
      return error.problem?.detail ?? 'This action is not allowed on your own account'
    if (error.status === 403) return 'You no longer have admin rights. Please log in again.'
    if (error.status === 404) return 'This user no longer exists'
  }
  return 'The action failed, please try again'
}
