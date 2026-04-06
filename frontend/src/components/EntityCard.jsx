import * as Dialog from "@radix-ui/react-dialog";

export default function EntityCard({ entity }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">
          {entity.name}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-xl font-bold text-slate-900">{entity.name}</Dialog.Title>
          <p className="mt-1 text-sm text-violet-600">{entity.type}</p>
          <p className="mt-4 text-slate-600">{entity.details}</p>
          <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            Suggested action: {entity.relatedAction}
          </p>
          <Dialog.Close asChild>
            <button className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-white">Close</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
