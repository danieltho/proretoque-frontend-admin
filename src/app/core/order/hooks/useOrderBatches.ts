import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function useOrderBatches() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const columns = useMemo(
    () =>
      getBatchColumns({
        onEdit: (batchId) => navigate(`/batch/${batchId}`),
        onDelete: () => {},
      }),
    [navigate],
  )

  return {}
}
