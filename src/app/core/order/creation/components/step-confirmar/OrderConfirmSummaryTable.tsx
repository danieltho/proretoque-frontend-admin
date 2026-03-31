interface BatchSummaryRow {
  id: string
  name: string
  fileCount: number
  deliveryTime: string
  format: string
}

interface OrderConfirmSummaryTableProps {
  rows: BatchSummaryRow[]
  totalFiles: number
}

export default function OrderConfirmSummaryTable({
  rows,
  totalFiles,
}: OrderConfirmSummaryTableProps) {
  return (
    <div className="w-full">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-2 text-left font-medium">Nombre</th>
            <th className="px-4 py-2 text-left font-medium">Fotos</th>
            <th className="px-4 py-2 text-left font-medium">Entrega</th>
            <th className="px-4 py-2 text-left font-medium">Formato</th>
            <th className="px-4 py-2 text-left font-medium">Precio</th>
            <th className="px-4 py-2 text-left font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border">
              <td className="px-4 py-2">{row.name}</td>
              <td className="px-4 py-2">{row.fileCount}</td>
              <td className="px-4 py-2">{row.deliveryTime}</td>
              <td className="px-4 py-2">{row.format}</td>
              <td className="px-4 py-2">$0.00</td>
              <td className="px-4 py-2">$0.00</td>
            </tr>
          ))}
          <tr>
            <td colSpan={6} className="px-4 py-2 text-right font-semibold">
              <span className="inline-block">N° total de fotos: {totalFiles}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
