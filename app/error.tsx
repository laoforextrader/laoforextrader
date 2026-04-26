"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">ເກີດຂໍ້ຜິດພາດບາງຢ່າງ</h2>
      <p className="text-gray-500 mb-6 max-w-md">
        {error.message || "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້ໃນຂະນະນີ້ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ"}
      </p>
      <button
        onClick={() => reset()}
        className="btn-primary"
      >
        ລອງໃໝ່ອີກຄັ້ງ
      </button>
    </div>
  )
}
