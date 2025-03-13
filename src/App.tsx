import { useEffect, useState } from "react";
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

  // Load lists from localStorage on first render
  useEffect(() => {
    const savedLists = localStorage.getItem("todoLists");
    if (savedLists) {
      try {
        setLists(JSON.parse(savedLists));
      } catch (error) {
        console.error("Error loading lists from localStorage:", error);
      }
    }
  }, []);

  // Save lists to localStorage whenever they change
  useEffect(() => {
    if (lists.length > 0) {
      localStorage.setItem("todoLists", JSON.stringify(lists));
    }
  }, [lists]);

  const addList = (): void => {
    if (listName.trim()) {
      setLists((prevLists) => {
        const newLists = [...prevLists, { id: Date.now(), name: listName, tasks: [], newTaskText: "" }];
        localStorage.setItem("todoLists", JSON.stringify(newLists)); // Save immediately
        return newLists;
      });
      setListName("");
    }
  };

  const addTask = (listId: number): void => {
    setLists((prevLists) => {
      const newLists = prevLists.map(list =>
        list.id === listId && list.newTaskText.trim()
          ? { ...list, tasks: [...list.tasks, { text: list.newTaskText.trim(), completed: false }], newTaskText: "" }
          : list
      );
      localStorage.setItem("todoLists", JSON.stringify(newLists)); // Save immediately
      return newLists;
    });
  };

  const toggleTask = (listId: number, taskIndex: number): void => {
    setLists((prevLists) => {
      const newLists = prevLists.map(list =>
        list.id === listId
          ? { ...list, tasks: list.tasks.map((task, index) => index === taskIndex ? { ...task, completed: !task.completed } : task) }
          : list
      );
      localStorage.setItem("todoLists", JSON.stringify(newLists)); // Save immediately
      return newLists;
    });
  };

  const removeTask = (listId: number, taskIndex: number): void => {
    setLists((prevLists) => {
      const newLists = prevLists
        .map(list => list.id === listId
          ? { ...list, tasks: list.tasks.filter((_, index) => index !== taskIndex) }
          : list
        )
        .filter(list => list.tasks.length > 0 || list.newTaskText.trim() !== "");
      localStorage.setItem("todoLists", JSON.stringify(newLists)); // Save immediately
      return newLists;
    });
  };

  const deleteList = (listId: number): void => {
    setLists((prevLists) => {
      const newLists = prevLists.filter(list => list.id !== listId);
      localStorage.setItem("todoLists", JSON.stringify(newLists)); // Save immediately
      return newLists;
    });
  };

  const startEditing = (listId: number, taskIndex: number, currentText: string): void => {
    setEditingTask({ listId, taskIndex });
    setEditText(currentText);
  };

  const saveEdit = (): void => {
    if (editingTask) {
      setLists((prevLists) => {
        const newLists = prevLists.map(list =>
          list.id === editingTask.listId
            ? {
                ...list,
                tasks: list.tasks.map((task, index) =>
                  index === editingTask.taskIndex ? { ...task, text: editText.trim() || task.text } : task
                ),
              }
            : list
        );
        localStorage.setItem("todoLists", JSON.stringify(newLists)); // Save immediately
        return newLists;
      });
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
