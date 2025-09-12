import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface Customer {
  _id: string;
  name: string;
  email: string;
  totalSpending: number;
  countVisits: number;
}

interface Props {
  available: Customer[];
  selected: Customer[];
  onAvailableChange: (customers: Customer[]) => void;
  onSelectedChange: (customers: Customer[]) => void;
}

const CustomerSelector: React.FC<Props> = ({
  available,
  selected,
  onAvailableChange,
  onSelectedChange,
}) => {
  const handleDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === "available" &&
      destination.droppableId === "selected"
    ) {
      const customer = available[source.index];
      if (!selected.find((c) => c._id === customer._id)) {
        onSelectedChange([...selected, customer]);

        const updatedAvailable = [...available];
        updatedAvailable.splice(source.index, 1);
        onAvailableChange(updatedAvailable);
      }
    } else if (
      source.droppableId === "selected" &&
      destination.droppableId === "selected"
    ) {
      const reordered = Array.from(selected);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      onSelectedChange(reordered);
    } else if (
      source.droppableId === "selected" &&
      destination.droppableId === "available"
    ) {
      const customer = selected[source.index];
      if (!available.find((c) => c._id === customer._id)) {
        onAvailableChange([...available, customer]);
      }
      const updatedSelected = [...selected];
      updatedSelected.splice(source.index, 1);
      onSelectedChange(updatedSelected);
    }
  };

  const handleAddAll = () => {
    onSelectedChange([...selected, ...available]);
    onAvailableChange([]);
  };

  const handleRemoveAll = () => {
    onAvailableChange([...available, ...selected]);
    onSelectedChange([]);
  };

  return (
    <div className="flex gap-6 mt-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 w-full">
          {/* Available Customers */}
          <Droppable droppableId="available">
            {(provided: any) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-1/2 bg-white rounded-lg shadow p-4 flex flex-col"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-medium">Available Customers</h2>
                  {available.length > 0 && (
                    <button
                      onClick={handleAddAll}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Add All →
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto max-h-[500px] pr-2">
                  {available.map((cust, index) => (
                    <Draggable
                      key={cust._id}
                      draggableId={cust._id}
                      index={index}
                    >
                      {(provided: any) => (
                        <div
                          className="border rounded p-2 mb-2 bg-slate-50"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <p className="font-semibold">{cust.name}</p>
                          <p className="text-sm text-gray-500">{cust.email}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>

          {/* Selected Audience */}
          <Droppable droppableId="selected">
            {(provided: any) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-1/2 bg-white rounded-lg shadow p-4 flex flex-col"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-medium">Selected Audience</h2>
                  {selected.length > 0 && (
                    <button
                      onClick={handleRemoveAll}
                      className="text-sm text-red-600 hover:underline"
                    >
                      ← Remove All
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto max-h-[500px] pr-2">
                  {selected.map((cust, index) => (
                    <Draggable
                      key={cust._id}
                      draggableId={cust._id}
                      index={index}
                    >
                      {(provided: any) => (
                        <div
                          className="border rounded p-2 mb-2 bg-green-50"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <p className="font-semibold">{cust.name}</p>
                          <p className="text-sm text-gray-500">{cust.email}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
};

export default CustomerSelector;
