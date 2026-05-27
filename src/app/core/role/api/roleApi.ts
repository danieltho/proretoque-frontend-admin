import alovaInstance from '@/app/shared/api/alovaInstance'
import type { Role, RolesListResponse, RoleAccessListResponse } from '../types/role'

export const getRolesApi = (page = 1) =>
  alovaInstance.Get<RolesListResponse>('/roles', {
    params: { page },
    cacheFor: 0,
  })

export const getRoleApi = (id: number) =>
  alovaInstance.Get<Role>(`/roles/${id}/detail`, { cacheFor: 0 })

export const createRoleApi = (data: { name: string; access: number[] }) =>
  alovaInstance.Post<{ role: Role }>('/roles', data)

export const updateRoleApi = (id: number, data: { name: string; access: number[] }) =>
  alovaInstance.Put<{ role: Role }>(`/roles/${id}`, data)

export const deleteRoleApi = (id: number) => alovaInstance.Delete<void>(`/roles/${id}`)

export const getRoleAccessListApi = () =>
  alovaInstance.Get<RoleAccessListResponse>('/role-access', { cacheFor: 0 })

export const createRoleRestrictionAccessApi = (roleId: number, data: { only_provider: number }) =>
  alovaInstance.Post<void>(`/roles/${roleId}/restriction-access`, data)
