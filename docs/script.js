'use strict';

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const papers = [...document.querySelectorAll('.paper[data-topic]')];
const contributionNote = document.querySelector('#equal-contribution-note');
function updateContributionNote() {
  contributionNote.hidden = !papers.some(paper => !paper.hidden && paper.dataset.equalContribution === 'true');
}
filterButtons.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.filter;
  filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let count = 0;
  papers.forEach(paper => {
    const visible = selected === 'all' || paper.dataset.topic === selected;
    paper.hidden = !visible;
    if (visible) count++;
  });
  document.querySelector('#research-count').textContent = `${count} SELECTED ${count === 1 ? 'PAPER' : 'PAPERS'}`;
  updateContributionNote();
}));

updateContributionNote();
document.querySelector('#year').textContent = new Date().getFullYear();
