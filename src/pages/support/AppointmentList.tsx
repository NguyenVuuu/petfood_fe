import { cn } from "@/lib/utils";

export default function AppointmentList() {
  const schedules = [
    { id: 1, customer: "Nguyễn Văn A", pet: "Max (Chó)", service: "Tắm rửa", time: "2024-01-20 09:00", status: "confirmed" },
    { id: 2, customer: "Trần Thị B", pet: "Miu (Mèo)", service: "Cắt tỉa lông", time: "2024-01-20 14:00", status: "pending" },
    { id: 3, customer: "Lê Minh C", pet: "Buddy (Chó)", service: "Khám sức khỏe", time: "2024-01-21 10:00", status: "confirmed" },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Support Panel</p>
        <h1 className="mt-2 text-3xl font-black text-gray-950 dark:text-white">Quản lý lịch hẹn</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Dữ liệu đang áp cứng JSON không phải từ Database</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Khách hàng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Thú cưng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Dịch vụ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Thời gian</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{schedule.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{schedule.pet}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{schedule.service}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{schedule.time}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={cn(
                        "inline-block px-3 py-1 rounded-full text-xs font-semibold",
                        schedule.status === "confirmed"
                          ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
                      )}
                    >
                      {schedule.status === "confirmed" ? "Xác nhận" : "Chờ xác nhận"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
