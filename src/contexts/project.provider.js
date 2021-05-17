import React from 'react';
import { createContext, useState, useEffect } from 'react';
import { getEventMappings, getProjectSettings } from '../utils/firebase';

export const ProjectContext = createContext({});

const ProjectProvider = ({ children, debug }) => {
    const [project, setProject] = useState({});

    useEffect(() => {
        if (debug) console.log('%c UPDATED PROJECT: ', 'background: #222; color: #ff0022', project)
    }, [project]); // eslint-disable-line react-hooks/exhaustive-deps

    const storeProjectSettings = async () => {
        try {
            const projectSettings = await getProjectSettings();
            setProject(prevProject => {
                return {
                    ...prevProject,
                    ...projectSettings
                }
            });
        } catch (error) {
            console.error("Could not load project settings");
        }
    };

    const storeEventMappings = async () => {
        try {
            const eventMappings = await getEventMappings();
            setProject(prevProject => {
                return {
                    ...prevProject,
                    events: { ...eventMappings }
                }
            });
        } catch (error) {
            console.error("Could not load event mappings", project)
        }
    };

    const reset = () => {
        setProject({});
    };

    return (
        <ProjectContext.Provider value={{
            project,
            storeProjectSettings,
            storeEventMappings,
            reset
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export default ProjectProvider;