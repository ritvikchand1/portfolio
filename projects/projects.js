import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const elem = document.querySelector('.projects-title');
if (elem) {
    elem.textContent = `${projects.length} Projects`;
}
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
