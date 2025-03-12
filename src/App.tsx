import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, CheckCircle, PlusCircle } from "lucide-react";
import "./App.css";

interface Task {
  text: string;
  completed: boolean;
}

interface TodoList {
  id: number;
  name: string;
  tasks: Task[];
  newTaskText: string;
}

export default function TodoApp() {
  const [lists, setLists] = useState<TodoList[]>([]);
  const [listName, setListName] = useState<string>("");
  const [editingTask, setEditingTask] = useState<{ listId: number; taskIndex: number } | null>(null);
  const [editText, setEditText] = useState<string>("");

  const addList = (): void => {
    if (listName.trim()) {
      setLists([...lists, { id: Date.now(), name: listName, tasks: [], newTaskText: "" }]);
      setListName("");
    }
  };

  const addTask = (listId: number): void => {
    setLists(lists.map(list =>
      list.id === listId && list.newTaskText.trim()
        ? { ...list, tasks: [...list.tasks, { text: list.newTaskText, completed: false }], newTaskText: "" }
        : list
    ));
  };

  const toggleTask = (listId: number, taskIndex: number): void => {
    setLists(prevLists =>
      prevLists.map(list =>
        list.id === listId
          ? { ...list, tasks: list.tasks.map((task, index) => index === taskIndex ? { ...task, completed: !task.completed } : task) }
          : list
      )
    );
  };

  const removeTask = (listId: number, taskIndex: number): void => {
    setLists(prevLists =>
      prevLists.map(list =>
        list.id === listId
          ? { ...list, tasks: list.tasks.filter((_, index) => index !== taskIndex) }
          : list
      ).filter(list => list.tasks.length > 0)
    );
  };

  const deleteList = (listId: number): void => {
    setLists(lists.filter(list => list.id !== listId));
  };

  const startEditing = (listId: number, taskIndex: number, currentText: string): void => {
    setEditingTask({ listId, taskIndex });
    setEditText(currentText);
  };

  const saveEdit = (): void => {
    if (editingTask) {
      setLists(lists.map(list =>
        list.id === editingTask.listId
          ? {
            ...list,
            tasks: list.tasks.map((task, index) =>
              index === editingTask.taskIndex ? { ...task, text: editText.trim() || task.text } : task
            ),
          }
          : list
      ));
      setEditingTask(null);
      setEditText("");
    }
  };

  const cancelEdit = (): void => {
    setEditingTask(null);
    setEditText("");
  };

  return (
    <div className="container">
      <h1 className="title">Tasks Organizer</h1>

      <div className="input-container">
        <input
          className="task-input"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="Enter list name..."
        />
        <button className="add-button" onClick={addList}>Create List</button>
      </div>

      <div className="lists-container">
        {lists.map((list) => (
          <motion.div
            key={list.id}
            className="list-card"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <h2 className="list-header">{list.name}</h2>

            <div className="list-input-container">
              <input
                className="task-input"
                value={list.newTaskText}
                onChange={(e) =>
                  setLists(lists.map(l => l.id === list.id ? { ...l, newTaskText: e.target.value } : l))
                }
                placeholder="Add a new task..."
              />
              <button className="add-button" onClick={() => addTask(list.id)}>
                <PlusCircle size={18} />
              </button>
            </div>

            <div className="task-list">
              {list.tasks.map((task, taskIndex) => (
                <motion.div
                  key={taskIndex}
                  className="task-card"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {editingTask?.listId === list.id && editingTask.taskIndex === taskIndex ? (
                    <input
                      className="task-input edit-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`task-text ${task.completed ? "completed" : ""}`}
                      onClick={() => startEditing(list.id, taskIndex, task.text)}
                    >
                      {task.text}
                    </span>
                  )}
                  <div className="icons">
                    {!editingTask || editingTask.listId !== list.id || editingTask.taskIndex !== taskIndex ? (
                      <CheckCircle className="icon check" onClick={() => toggleTask(list.id, taskIndex)} />
                    ) : null}
                    <Trash2 className="icon delete" onClick={() => removeTask(list.id, taskIndex)} />
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="delete-list" onClick={() => deleteList(list.id)}>
              <span className="delete-text">Delete List</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
