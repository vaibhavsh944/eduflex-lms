import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface BulkActionBarProps {
  selectedCount: number;
  selectedIds: string[];
  onBulkRoleChange: (role: string) => void;
  onBulkDeactivate: () => void;
  onBulkExport: () => void;
  onClear: () => void;
}

export function BulkActionBar({
  selectedCount,
  selectedIds: _selectedIds,
  onBulkRoleChange,
  onBulkDeactivate,
  onBulkExport,
  onClear,
}: BulkActionBarProps) {
  const [bulkRole, setBulkRole] = useState('student');
  const [showConfirm, setShowConfirm] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-lg border bg-background px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Select value={bulkRole} onValueChange={(v) => { if (v) setBulkRole(v); }}>
              <SelectTrigger className="h-8 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                onBulkRoleChange(bulkRole);
                setShowConfirm(false);
              }}
            >
              Assign Role
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => { setShowConfirm(true); }}
          >
            Deactivate All
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={onBulkExport}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate {selectedCount} users?</DialogTitle>
            <DialogDescription>
              These users will no longer be able to log in. You can reactivate them later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowConfirm(false); }}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => { onBulkDeactivate(); setShowConfirm(false); }}
            >
              Deactivate All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
