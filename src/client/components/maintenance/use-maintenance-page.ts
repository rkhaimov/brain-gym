import type { MouseEvent } from 'react';
import { useRef, useState } from 'react';

export type MaintenanceMutationResult =
  | Readonly<{ case: 'success' }>
  | Readonly<{ case: 'failure'; message: string }>;

interface MaintenancePageOptions<Entity> {
  readonly refresh: () => Promise<void>;
  readonly setArchived: (entity: Entity, archived: boolean) => Promise<MaintenanceMutationResult>;
}

export function useMaintenancePage<Entity>({
  refresh,
  setArchived,
}: MaintenancePageOptions<Entity>) {
  const [showArchived, setShowArchived] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editedEntity, setEditedEntity] = useState<Entity>();
  const createDialogTrigger = useRef<HTMLButtonElement | null>(null);
  const editDialogTrigger = useRef<HTMLButtonElement | null>(null);

  function openCreateDialog(event: MouseEvent<HTMLButtonElement>): void {
    createDialogTrigger.current = event.currentTarget;
    setCreateDialogOpen(true);
  }

  function openEditDialog(event: MouseEvent<HTMLButtonElement>, entity: Entity): void {
    editDialogTrigger.current = event.currentTarget;
    setEditedEntity(entity);
  }

  async function changeArchived(entity: Entity, archived: boolean): Promise<void> {
    const response = await setArchived(entity, archived);
    if (response.case === 'failure') throw new Error(response.message);
    await refresh();
  }

  return {
    changeArchived,
    createDialogOpen,
    createDialogTrigger,
    editedEntity,
    editDialogTrigger,
    openCreateDialog,
    openEditDialog,
    setCreateDialogOpen,
    setEditedEntity,
    setShowArchived,
    showArchived,
  };
}
