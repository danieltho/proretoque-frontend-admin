import alovaInstance from '@/app/shared/api/alovaInstance'
import type { Role, RolesListResponse, RoleAccessListResponse } from '../types/role'

export const getRolesApi = (page = 1) =>
  alovaInstance.Get<RolesListResponse>('/backend/roles', {
    params: { page },
    cacheFor: 0,
  })

export const getRoleApi = (id: number) =>
  alovaInstance.Get<Role>(`/backend/roles/${id}/detail`, { cacheFor: 0 })

export const updateRoleApi = (id: number, data: { name: string; access: number[] }) =>
  alovaInstance.Put<{ role: Role }>(`/backend/roles/${id}`, data)

export const deleteRoleApi = (id: number) =>
  alovaInstance.Delete<void>(`/backend/roles/${id}`)

export const getRoleAccessListApi = () =>
  alovaInstance.Get<RoleAccessListResponse>('/backend/role-access', { cacheFor: 0 })
