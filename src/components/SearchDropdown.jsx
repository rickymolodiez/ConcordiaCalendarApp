
import React, { useState, useEffect } from 'react';
import '../styles/searchDropDown.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Make sure your firebase export is correct

const SearchDropdown = ({ onSubscribe }) => {
  const [query, setQuery] = useState('');
  const [allItems, setAllItems] = useState([]);
  const [filtered, setFiltered] = useState([]);

  // ⬇️ Fetch event labels, categories, and organizers from Firebase
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'eventsFromApp'));
        const allResults = [];
        snapshot.forEach(doc => {
          const data = doc.data();

          // Push Event Name
          if (data.label) {
            allResults.push({ name: data.label, type: 'Event' });
          }

          // Push Category
          if (data.category) {
            allResults.push({ name: data.category, type: 'Event' });
          }

          // Push Organizer as Club
          if (data.organizer) {
            allResults.push({ name: data.organizer, type: 'Club' });
          }
        });

        // Remove duplicates by name + type
        const uniqueResults = Array.from(
          new Map(allResults.map(item => [`${item.name}-${item.type}`, item])).values()
        );

        setAllItems(uniqueResults);
      } catch (error) {
        console.error("Error fetching search items:", error);
      }
    };

    fetchItems();
  }, []);

  // 🔍 Handle user typing in the input
  const handleInput = (e) => {
    const value = e.target.value;
    setQuery(value);

    const matched = allItems.filter(item =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );

    setFiltered(value.length ? matched : []);
  };

  const handleClick = (item) => {
    if (item.type === 'Club') {
      onSubscribe(item.name); // Add to subscriptions
    }
    setQuery('');
    setFiltered([]);
  };

  return (
    <div className="search-container">
      <div className="search-bar">
        <img src="../src/assets/searchIcon.png" className="search-icon" alt="search" />
        <input
          type="text"
          placeholder="Search events, clubs and more…"
          value={query}
          onChange={handleInput}
        />
      </div>

      {filtered.length > 0 && (
        <div className="search-dropdown">
          {filtered.map((item, idx) => (
            <div key={idx} className="search-item" onClick={() => handleClick(item)}>
              <span>{item.name}</span>
              <span className="item-type">{item.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;

