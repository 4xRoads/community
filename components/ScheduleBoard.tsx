"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { DriverCard } from "./DriverCard";
import { Plus, ChevronLeft, ChevronRight, Search, Clock } from "lucide-react";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
} from "date-fns";

// Minimal UI shape used here
export type UiShift = {
  id: string;
  driver: string;
  driverName?: string;
  route: string;
  date: string;      // yyyy-MM-dd
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  status: "scheduled" | "confirmed" | "pending" | "called_off" | "completed";
  vehicle?: string;
  backupDriver?: string;
  backupDriverName?: string;
  hoursWorked?: number;
};

interface ScheduleBoardProps {
  onCreateShift: () => void;
  shifts: UiShift[]; // If empty, component falls back to local mocks
  onUpdateShift: (shiftId: string, data: Partial<UiShift>) => void;
  onDeleteShift: (shiftId: string) => void;
  onEditShift?: (shiftData: UiShift) => void;
}

// Mock driver data for the summary
const mockDrivers = [
  { id: "driver-1", name: "John Smith" },
  { id: "driver-2", name: "Sarah Johnson" },
  { id: "driver-3", name: "Mike Rodriguez" },
  { id: "driver-4", name: "Emily Chen" },
  { id: "driver-5", name: "David Wilson" },
  { id: "driver-6", name: "Lisa Brown" },
  { id: "driver-7", name: "Tom Anderson" },
  { id: "driver-8", name: "Maria Garcia" },
];

export function ScheduleBoard({
  onCreateShift,
  shifts,
  // Not used yet; rename with underscore so ESLint doesn't warn
  onUpdateShift: _onUpdateShift,
  onDeleteShift: _onDeleteShift,
  onEditShift,
}: ScheduleBoardProps) {
