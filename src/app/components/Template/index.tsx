import Header from '../layout/Header'
import MobileSidebar from '../layout/MobileSidebar'
import Sidebar from '../layout/Sidebar'

export default function Template({ children }) {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 bg-[#f5f5f5] p-6">{children}</main>
        </div>
        <MobileSidebar />
      </div>
    </>
  )
}
