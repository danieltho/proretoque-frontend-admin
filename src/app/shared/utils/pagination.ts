export function calculateTotalPage(totalCount: number, pages: number): number {

  const pageSize = Math.floor(totalCount / pages)

  if (pageSize > pages ) return 1

  return pageSize
}
