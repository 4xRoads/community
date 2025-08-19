"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Car } from "lucide-react";

export interface DriverCardData {
  id: string;
  driver: string;           // driver ID or name
  driverName?: string;      // display name
  driver_name?: string;     // alt display field
  route: string;
  date: string;
  vehicle: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "confirmed" | "pending" | "called_off" | "completed";
  hours_worked?: number;
  backup_driver?: string;
  backup_driver_name?: string;
  qualification?: string[];
}

interface DriverCardProps {
  shift: DriverCardData;
  compact?: boolean;
  onClick?: (shiftData: DriverCardData) => void;
}

export function DriverCard({ shift, compact = false, onClick }: DriverCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "called_off":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");

  const formatTime = (time?: string) => {
    if (!time) return "00:00";
    return time.length > 5 ? time.substring(0, 5) : time;
  };

  const getDisplayName = (driverId: string, driverName?: string, driver_name?: string) => {
    if (driverName && driverName !== driverId) return driverName;
    if (driver_name && driver_name !== driverId) return driver_name;
    if (driverId === "unassigned" || !driverId) return "Unassigned";
    return driverId;
  };

  const getBackupDisplayName = (backupDriver?: string, backupDriverName?: string) => {
    if (backupDriverName && backupDriverName !== backupDriver) return backupDriverName;
    if (backupDriver === "none" || backupDriver === "unassigned" || !backupDriver) return "None";
    return backupDriver;
  };

  const handleClick = () => {
    if (onClick) {
      const shiftData: DriverCardData = {
        ...shift,
        start_time: shift.start_time || "08:00",
        end_time: shift.end_time || "16:00",
        hours_worked: shift.hours_worked ?? 8,
        backup_driver: shift.backup_driver || "none",
        qualification: shift.qualification || [],
      };
      onClick(shiftData);
    }
  };

  const driverDisplayName = getDisplayName(shift.driver, shift.driverName, shift.driver_name);
  const backupDisplayName = getBackupDisplayName(shift.backup_driver, shift.backup_driver_name);

  return (
    <Card
      className={`hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${compact ? "text-sm" : ""} w-full`}
      onClick={handleClick}
    >
      <CardContent className={`${compact ? "p-3" : "p-4"} space-y-3`}>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <User className={`${compact ? "w-3 h-3" : "w-4 h-4"} text-muted-foreground flex-shrink-0 mt-0.5`} />
            <span className={`font-medium break-words overflow-wrap-anywhere ${compact ? "text-sm" : "text-base"}`}>
              {driverDisplayName}
            </span>
          </div>

          <div className="flex justify-start">
            <Badge className={`text-xs px-2 py-1 ${getStatusColor(shift.status)} w-fit`}>
              {getStatusLabel(shift.status)}
            </Badge>
          </div>
        </div>

        <div className={`space-y-2 ${compact ? "text-xs" : "text-sm"}`}>
          <div className="flex items-start space-x-2">
            <Calendar className={`${compact ? "w-2 h-2" : "w-3 h-3"} text-muted-foreground flex-shrink-0 mt-0.5`} />
            <span className="break-words overflow-wrap-anywhere text-muted-foreground">
              {shift.route || "No route assigned"}
            </span>
          </div>

          <div className="flex items-start space-x-2">
            <Clock className={`${compact ? "w-2 h-2" : "w-3 h-3"} text-muted-foreground flex-shrink-0 mt-0.5`} />
            <span className="text-muted-foreground whitespace-nowrap">
              {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
            </span>
          </div>

          {shift.vehicle && (
            <div className="flex items-start space-x-2">
              <Car className={`${compact ? "w-2 h-2" : "w-3 h-3"} text-muted-foreground flex-shrink-0 mt-0.5`} />
              <span className="break-words overflow-wrap-anywhere text-muted-foreground">{shift.vehicle}</span>
            </div>
          )}
        </div>

        <div className={`space-y-1 ${compact ? "text-xs" : "text-xs"}`}>
          {shift.backup_driver && shift.backup_driver !== "none" && (
            <div className="text-muted-foreground">
              <span className="font-medium">Backup:</span>{" "}
              <span className="break-words overflow-wrap-anywhere">{backupDisplayName}</span>
            </div>
          )}

          {shift.hours_worked !== undefined && (
            <div className="text-muted-foreground">
              <span className="font-medium">Hours:</span> <span>{shift.hours_worked}h</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
