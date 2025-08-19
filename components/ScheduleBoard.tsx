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

/** Minimal UI shape used by this component */
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

type UiShiftUpdate = Partial<UiShift>;

interface ScheduleBoardProps {
  onCreateShift: () => void;
  shifts: UiShift[]; // If empty, this component falls back to its own mocks
  onUpdateShift: (shiftId: string, data: UiShiftUpdate) => void;
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
  // These are kept for future wiring; prefix with "_" to avoid the ESLint unused-var warning
  onUpdateShift: _onUpdateShift,
  onDeleteShift: _onDeleteShift,
  onEditShift,
}: ScheduleBoardProps) {
  const [currentWeek, setCurrentWeek] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [filterDriver, setFilterDriver] = useState<string>("all");
  const [filterRoute, setFilterRoute] = useState<string>("all");
  const [filterVehicle, setFilterVehicle] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Week days (Mon..Sun)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  // Header range
  const weekStart = format(currentWeek, "MMM d");
  const weekEnd = format(addDays(currentWeek, 6), "MMM d, yyyy");
  const weekRange = `${weekStart}–${weekEnd}`;

  // Local mock shifts (typed to UiShift)
  const mockShifts: UiShift[] = [
    {
      id: "shift-1",
      driver: "John Smith",
      route: "Route A-1",
      date: format(addDays(currentWeek, 0), "yyyy-MM-dd"),
      startTime: "08:00",
      endTime: "16:00",
      status: "confirmed",
      vehicle: "TRK-001",
      backupDriver: "Sarah Johnson",
      hoursWorked: 8,
    },
    {
      id: "shift-2",
      driver: "Sarah Johnson",
      route: "Route B-2",
      date: format(addDays(currentWeek, 0), "yyyy-MM-dd"),
      startTime: "06:00",
      endTime: "14:00",
      status: "scheduled",
      vehicle: "TRK-002",
      hoursWorked: 8,
    },
    {
      id: "shift-3",
      driver: "Mike Rodriguez",
      route: "Route C-3",
      date: format(addDays(currentWeek, 1), "yyyy-MM-dd"),
      startTime: "07:00",
      endTime: "15:00",
      status: "confirmed",
      vehicle: "TRK-003",
      hoursWorked: 8,
    },
    {
      id: "shift-4",
      driver: "John Smith",
      route: "Route A-1",
      date: format(addDays(currentWeek, 2), "yyyy-MM-dd"),
      startTime: "08:00",
      endTime: "16:00",
      status: "scheduled",
      vehicle: "TRK-001",
      hoursWorked: 8,
    },
    {
      id: "shift-5",
      driver: "Emily Chen",
      route: "Route D-4",
      date: format(addDays(currentWeek, 3), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "17:00",
      status: "confirmed",
      vehicle: "TRK-004",
      hoursWorked: 8,
    },
    {
      id: "shift-6",
      driver: "David Wilson",
      route: "Route E-5",
      date: format(addDays(currentWeek, 4), "yyyy-MM-dd"),
      startTime: "08:00",
      endTime: "12:00",
      status: "called_off",
      vehicle: "TRK-005",
      hoursWorked: 0,
    },
    {
      id: "shift-7",
      driver: "Lisa Brown",
      route: "Route F-6",
      date: format(addDays(currentWeek, 5), "yyyy-MM-dd"),
      startTime: "10:00",
      endTime: "14:00",
      status: "completed",
      vehicle: "TRK-006",
      hoursWorked: 4,
    },
  ];

  // Prefer incoming shifts; if none, use mocks
  const allShifts: UiShift[] = shifts.length > 0 ? shifts : mockShifts;

  // Filter to current week
  const weekShifts = allShifts.filter((shift) => {
    const d = new Date(shift.date);
    const wkStart = currentWeek;
    const wkEnd = addDays(currentWeek, 6);
    return d >= wkStart && d <= wkEnd;
  });

  // Apply filters
  const filteredShifts = weekShifts.filter((shift) => {
    if (filterDriver !== "all" && shift.driver !== filterDriver) return false;
    if (filterRoute !== "all" && shift.route !== filterRoute) return false;
    if (filterVehicle !== "all" && shift.vehicle !== filterVehicle) return false;
    if (
      searchTerm &&
      !shift.driver.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !shift.route.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  // Group by day
  const shiftsGroupedByDay = weekDays.map((day) => ({
    date: day,
    shifts: filteredShifts.filter((shift) =>
      isSameDay(new Date(shift.date), day)
    ),
  }));

  // Driver-hours summary (uses mockDrivers for a stable list)
  const driverHours = mockDrivers
    .map((driver) => {
      const driverShifts = weekShifts.filter((s) => s.driver === driver.name);
      const totalHours = driverShifts.reduce(
        (sum, s) => sum + (s.hoursWorked ?? 8),
        0
      );
      const totalShifts = driverShifts.length;
      return {
        name: driver.name,
        hours: totalHours,
        shifts: totalShifts,
        status: totalHours > 40 ? "overtime" : totalHours > 32 ? "full" : "part",
      };
    })
    .sort((a, b) => b.hours - a.hours);

  // Unique filter values
  const uniqueDrivers = [...new Set(allShifts.map((s) => s.driver).filter(Boolean))].sort();
  const uniqueRoutes = [...new Set(allShifts.map((s) => s.route).filter(Boolean))].sort();
  const uniqueVehicles = [...new Set(allShifts.map((s) => s.vehicle).filter(Boolean))].sort();

  const handlePreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

  const getCurrentTime = () => format(new Date(), "HH:mm");

  const getCurrentShift = (dayShifts: UiShift[]) => {
    if (!dayShifts.length || !isToday(new Date(dayShifts[0].date))) return null;
    const now = getCurrentTime();
    return dayShifts.find((s) => s.startTime <= now && s.endTime >= now) || null;
  };

  const getHoursColor = (h: number) =>
    h > 40 ? "text-red-600" : h > 32 ? "text-green-600" : "text-yellow-600";

  const clearAllFilters = () => {
    setFilterDriver("all");
    setFilterRoute("all");
    setFilterVehicle("all");
    setSearchTerm("");
  };

  return (
    <div className="space-y-6">
      {/* Header with Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold">Driver Schedule</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek} aria-label="Previous week">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-4 py-2 bg-muted rounded-md min-w-[200px] text-center">
              <span className="font-medium">{weekRange}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleNextWeek} aria-label="Next week">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Button onClick={onCreateShift} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Shift</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Driver or route..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Driver</Label>
              <Select value={filterDriver} onValueChange={setFilterDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="All drivers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All drivers</SelectItem>
                  {uniqueDrivers.map((driver) => (
                    <SelectItem key={driver} value={driver}>
                      {driver}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Route</Label>
              <Select value={filterRoute} onValueChange={setFilterRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="All routes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All routes</SelectItem>
                  {uniqueRoutes.map((route) => (
                    <SelectItem key={route} value={route}>
                      {route}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vehicle</Label>
              <Select value={filterVehicle} onValueChange={setFilterVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="All vehicles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All vehicles</SelectItem>
                  {uniqueVehicles.map((vehicle) => (
                    <SelectItem key={vehicle} value={vehicle || ""}>
                      {vehicle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearAllFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Weekly Schedule Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-7 gap-4">
            {shiftsGroupedByDay.map(({ date, shifts }, dayIndex) => {
              const isCurrentDay = isToday(date);
              const currentShift = getCurrentShift(shifts);

              return (
                <div key={dayIndex} className="space-y-3">
                  {/* Day Header */}
                  <div
                    className={`text-center p-3 rounded-lg border ${
                      isCurrentDay
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border-soft"
                    }`}
                  >
                    <div className="font-medium text-sm">{format(date, "EEE")}</div>
                    <div
                      className={`text-lg font-semibold ${
                        isCurrentDay ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {format(date, "d")}
                    </div>
                  </div>

                  {/* Shifts for this day */}
                  <div className="space-y-3 min-h-[200px]">
                    {shifts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No shifts
                      </div>
                    ) : (
                      shifts.map((shift) => (
                        <div
                          key={shift.id}
                          className={`${
                            currentShift?.id === shift.id ? "ring-2 ring-primary shadow-md" : ""
                          }`}
                        >
                          <DriverCard
                            shift={{
                              id: shift.id,
                              driver: shift.driver,
                              driverName: shift.driverName || shift.driver,
                              route: shift.route,
                              date: shift.date,
                              vehicle: shift.vehicle || "",
                              start_time: shift.startTime || "08:00",
                              end_time: shift.endTime || "16:00",
                              status: shift.status,
                              hours_worked: shift.hoursWorked,
                              backup_driver: shift.backupDriver,
                              backup_driver_name:
                                shift.backupDriverName || shift.backupDriver,
                            }}
                            compact={true}
                            onClick={(shiftData) =>
                              onEditShift &&
                              onEditShift({
                                ...shiftData,
                                id: shift.id,
                                driverName: shift.driverName || shift.driver,
                                // convert DriverCard shape back to UiShift where needed
                                startTime: shiftData.start_time,
                                endTime: shiftData.end_time,
                                hoursWorked: shiftData.hours_worked,
                                backupDriver: shiftData.backup_driver,
                                backupDriverName: shiftData.backup_driver_name,
                              } as unknown as UiShift)
                            }
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Driver Hours Summary Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Driver Hours (This Week)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {driverHours.map((driver) => (
                <div
                  key={driver.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{driver.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {driver.shifts} shift{driver.shifts !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium text-sm ${getHoursColor(driver.hours)}`}>
                      {driver.hours}h
                    </span>
                    {driver.hours > 40 && (
                      <Badge variant="destructive" className="text-xs">
                        OT
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {driverHours.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No driver hours for this week
                </div>
              )}

              {/* Summary */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Hours:</span>
                  <span className="font-medium">
                    {driverHours.reduce((sum, d) => sum + d.hours, 0)}h
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Drivers:</span>
                  <span className="font-medium">
                    {driverHours.filter((d) => d.hours > 0).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overtime:</span>
                  <span className="font-medium text-red-600">
                    {driverHours.filter((d) => d.hours > 40).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
