"use client";
import { ScheduleBoard, UiShift } from "@/components/ScheduleBoard";

export default function Home() {
  // leave empty so ScheduleBoard uses its internal mocks
  const shifts: UiShift[] = [];
  const noop = () => {};
  
  return (
    <main className="p-6 max-w-7xl mx-auto">
      <ScheduleBoard
        shifts={shifts}
        onCreateShift={noop}
        onUpdateShift={noop}
        onDeleteShift={noop}
        onEditShift={noop}
      />
    </main>
  );
}
