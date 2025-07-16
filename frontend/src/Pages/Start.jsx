import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import Button from "../Button";

const Start = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const debounceRef = useRef(null);

  const fetchCourses = async (query) => {
    try {
      const res = await fetch(
        `https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent(query)}`,
        { headers: { Authorization: "Key SFLYRBLKGKXXKS7TVE2BYBV4LI" } }
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setCourses(json.courses || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setCourses([]);
    }
  };

  // Debounced API fetch when user types 3+ chars
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchTerm.length < 3) {
      setCourses([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchCourses(searchTerm);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  // Update filtered list as courses or searchTerm changes
  useEffect(() => {
    if (searchTerm.length < 1) {
      setFiltered([]);
    } else {
      setFiltered(
        courses.filter((c) =>
          c.course_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, courses]);

  const handleSelect = (course) => {
    setSelectedCourse(course);
    setSearchTerm(course.course_name);
    setFiltered([]);
    // TODO: navigate or load detailed view for `course`
  };

  return (
    <div className="card">
      <input
        type="text"
        placeholder="Search courses…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
        aria-label="Search golf courses"
      />

      {filtered.length > 0 && (
        <ul className="results-dropdown" role="listbox">
          {filtered.map((course) => (
            <li
              key={course.id}
              role="option"
              aria-selected={course.id === selectedCourse?.id}
            >
              <button
                type="button"
                className="option-button"
                onClick={() => handleSelect(course)}
              >
                {course.course_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="button-container">
                <Button txt = "Start" page="/holes/1"/>
            </div> 
    </div>
  );
};

export default Start;
