import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/contacts";
import { v4 as uuidv4 } from "uuid";

const contactsCrudContext = createContext();

export function ContactsCrudContextProvider({ children }) {
  const [contacts, setContacts] = useState([]);
  const [contact, setContact] = useState({});
  const [text, setText] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // RetrieveContacts
  const retrieveContacts = async () => {
    try {
      const response = await api.get("/contacts");
      if (response.data) {
        setContacts(response.data);
      }
    } catch (error) {
      console.error("Error retrieving contacts:", error);
    }
  };

  useEffect(() => {
    retrieveContacts();
  }, []); // Fetch contacts on component mount

  const addContactHandler = async (contactData) => {
    try {
      const newContact = {
        id: uuidv4(), // Use uuidv4 here
        ...contactData,
      };
      const response = await api.post("/contacts", newContact);
      setContacts([...contacts, response.data]);
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  const removeContactHandler = async (id) => {
    try {
      await api.delete(`/contacts/${id}`);
      const newContactList = contacts.filter((contact) => contact.id !== id);
      setContacts(newContactList);
    } catch (error) {
      console.error("Error removing contact:", error);
    }
  };

  const updateContactHandler = async (updatedContact) => {
    try {
      const response = await api.put(`/contacts/${updatedContact.id}`, updatedContact);
      const updatedContacts = contacts.map((contact) =>
        contact.id === updatedContact.id ? response.data : contact
      );
      setContacts(updatedContacts);
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  const searchHandler = (searchTerm) => {
    setText(searchTerm);
    if (searchTerm !== "") {
      const newContactList = contacts.filter((contact) =>
        Object.values(contact)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setSearchResults(newContactList);
    } else {
      setSearchResults(contacts);
    }
  };

  const value = {
    contact,
    contacts,
    retrieveContacts,
    addContactHandler,
    removeContactHandler,
    updateContactHandler,
    searchHandler,
    text,
    searchResults,
  };

  return (
    <contactsCrudContext.Provider value={value}>
      {children}
    </contactsCrudContext.Provider>
  );
}

export function useContactsCrud() {
  return useContext(contactsCrudContext);
}
