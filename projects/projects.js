import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');

const elem = document.querySelector('.projects-title');
if (elem) {
    elem.textContent = `${projects.length} Projects`;
}

const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

let selectedIndex = -1;
let query = '';

function filterProjectsBySearch(projectsToFilter) {
    if (!query) return projectsToFilter;
    
    return projectsToFilter.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
}

function renderPieChart(projectsGiven) {
    let newSVG = d3.select('#projects-plot');
    newSVG.selectAll('path').remove();

    d3.select('.legend').selectAll('*').remove();

    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );

    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => newArcGenerator(d));
    let newColors = d3.scaleOrdinal(d3.schemeTableau10);

    newArcs.forEach((arc, idx) => {
        newSVG
            .append('path')
            .attr('d', arc)
            .attr('fill', newColors(idx))
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .attr('class', idx === selectedIndex ? 'selected' : '')
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx;
                
                newSVG
                    .selectAll('path')
                    .attr('class', (_, i) => i === selectedIndex ? 'selected' : '');

                d3.select('.legend')
                    .selectAll('li')
                    .attr('class', (_, i) => {
                        let baseClass = 'legend-item';
                        return i === selectedIndex ? `${baseClass} selected` : baseClass;
                    });

                let filteredProjects = projects;
                
                if (selectedIndex !== -1) {
                    let selectedYear = newData[selectedIndex].label;
                    filteredProjects = filteredProjects.filter(project => 
                        project.year == selectedYear || 
                        project.year === parseInt(selectedYear) ||
                        project.year === selectedYear.toString()
                    );
                }
                
                if (query) {
                    filteredProjects = filterProjectsBySearch(filteredProjects);
                }
                
                renderProjects(filteredProjects, projectsContainer, 'h2');
                updateTitle(filteredProjects);
            });
    });

    let legend = d3.select('.legend');
    newData.forEach((d, idx) => {
        legend
            .append('li')
            .attr('class', `legend-item${idx === selectedIndex ? ' selected' : ''}`)
            .attr('style', `--color:${newColors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx;

                newSVG
                    .selectAll('path')
                    .attr('class', (_, i) => i === selectedIndex ? 'selected' : '');

                legend
                    .selectAll('li')
                    .attr('class', (_, i) => {
                        let baseClass = 'legend-item';
                        return i === selectedIndex ? `${baseClass} selected` : baseClass;
                    });

                let filteredProjects = projects;
                
                if (selectedIndex !== -1) {
                    let selectedYear = newData[selectedIndex].label;
                    filteredProjects = filteredProjects.filter(project => 
                        project.year == selectedYear || 
                        project.year === parseInt(selectedYear) ||
                        project.year === selectedYear.toString()
                    );
                }
                
                if (query) {
                    filteredProjects = filterProjectsBySearch(filteredProjects);
                }
                
                renderProjects(filteredProjects, projectsContainer, 'h2');
                updateTitle(filteredProjects);
            });
    });
}

function updateTitle(displayedProjects) {
    const elem = document.querySelector('.projects-title');
    if (elem) {
        elem.textContent = `${displayedProjects.length} Projects`;
    }
}

renderPieChart(projects);

let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    selectedIndex = -1;
    
    let filteredProjects = filterProjectsBySearch(projects);
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
    updateTitle(filteredProjects);
});