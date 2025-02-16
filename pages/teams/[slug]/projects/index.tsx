import React, { useState, useEffect } from 'react';
import axios from 'axios';

console.log("You coded Correct")

const Projects = () => {
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [projectList, setProjectList] = useState<any[]>([]);

  const handleMouseEnter = () => setIsProjectsOpen(true);
  const handleMouseLeave = () => setIsProjectsOpen(false);

  const fetchAllProject = async () => {
    try {
      const response = await axios.get('/api/projects');
      const newData = response.data.data;
      console.log('newData from project list', newData);

      setProjectList(newData);
    } catch (error) {
      console.error('Error fetching projectlist', error);
    }
  };
  useEffect(() => {
    fetchAllProject();
  }, []);

  return (
    <div className="flex flex-col space-y-4 w-full group">
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isProjectsOpen && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {projectList.map(({ id, projectName }) => (
              <a
                key={id}
                //  href={`/teams/${slug}/projects/${id}`}
                href={`/projects/${id}`}
                className="block p-2 hover:bg-gray-100 text-black rounded-lg"
              >
                {projectName}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Projects;
