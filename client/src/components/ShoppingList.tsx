import type { ShoppingListItem } from "../types";

interface Props {
  items: ShoppingListItem[];
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}

export function shoppingItemKey(item: ShoppingListItem): string {
  return `${item.category}::${item.item}`;
}

export function ShoppingList({ items, checked, onToggle }: Props) {
  const grouped = items.reduce<Record<string, ShoppingListItem[]>>((acc, item) => {
    const key = item.category || "Other";
    acc[key] = acc[key] ?? [];
    acc[key].push(item);
    return acc;
  }, {});

  const doneCount = items.filter((i) => checked[shoppingItemKey(i)]).length;

  function downloadList() {
    const lines = Object.entries(grouped).flatMap(([category, catItems]) => [
      `${category}:`,
      ...catItems.map((i) => `  ${checked[shoppingItemKey(i)] ? "[x]" : "[ ]"} ${i.quantity} ${i.item}`),
      "",
    ]);
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shopping-list.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900">
          Shopping list <span className="text-sm font-normal text-gray-400">({doneCount}/{items.length} done)</span>
        </h3>
        <button
          onClick={downloadList}
          className="text-sm text-brand-700 hover:text-brand-800 font-medium"
        >
          Download .txt
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(grouped).map(([category, catItems]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">{category}</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {catItems.map((item) => {
                const key = shoppingItemKey(item);
                const isChecked = !!checked[key];
                return (
                  <li key={key}>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle(key)}
                        className="mt-0.5 accent-brand-600"
                      />
                      <span className={isChecked ? "line-through text-gray-400" : ""}>
                        <span className="text-gray-400 mr-1">{item.quantity}</span>
                        {item.item}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
