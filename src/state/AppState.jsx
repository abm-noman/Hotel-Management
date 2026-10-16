import { createContext, useContext, useReducer } from "react";

const initial = {
  role: "cleaner",
  panel: null, // { type: 'job' | 'task' | ..., id }
  jobs: [
    {
      id: "j1",
      property: "Roskildevej 148",
      cleaner: "Sabbir",
      time: "10:00–14:00",
      status: "To Do",
      notices: ["Previous cleaner: bring extra towels"],
    },
    {
      id: "j2",
      property: "Vesterbrogade 22",
      cleaner: "Anna",
      time: "12:00–15:00",
      status: "To Do",
      notices: [],
    },
  ],
  tasks: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, role: action.role, panel: null };
    case "OPEN_PANEL":
      return { ...state, panel: action.panel };
    case "CLOSE_PANEL":
      return { ...state, panel: null };
    default:
      return state;
  }
}

const Ctx = createContext(null);
export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}
export const useApp = () => useContext(Ctx);
