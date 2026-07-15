export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  content: string;
}

export const noteTemplates: NoteTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Note',
    description: 'Start from scratch',
    icon: '📝',
    content: ''
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Document meeting details',
    icon: '🤝',
    content: `# Meeting Notes

## Date
${new Date().toLocaleDateString()}

## Attendees
- 

## Agenda
1. 
2. 
3. 

## Discussion Notes


## Action Items
- [ ] 

## Next Meeting
- Date: 
- Topics: 
`
  },
  {
    id: 'daily-journal',
    name: 'Daily Journal',
    description: 'Track your daily thoughts',
    icon: '📔',
    content: `# Daily Journal - ${new Date().toLocaleDateString()}

## Mood
😊 

## Gratitude
1. 
2. 
3. 

## Highlights


## Lessons Learned


## Tomorrow's Goals
- [ ] 
- [ ] 
- [ ] 
`
  },
  {
    id: 'project-plan',
    name: 'Project Plan',
    description: 'Plan your project',
    icon: '📋',
    content: `# Project Plan

## Overview
**Objective:** 
**Timeline:** 
**Status:** 🟡 In Progress

## Goals
1. 
2. 
3. 

## Tasks
### Phase 1
- [ ] 
- [ ] 

### Phase 2
- [ ] 
- [ ] 

## Resources
- 

## Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
|      |        |            |

## Progress Log
| Date | Update |
|------|--------|
|      |        |
`
  },
  {
    id: 'book-notes',
    name: 'Book Notes',
    description: 'Summarize a book',
    icon: '📚',
    content: `# Book Notes

## Book Info
**Title:** 
**Author:** 
**Rating:** ⭐⭐⭐⭐⭐

## Key Takeaways
1. 
2. 
3. 

## Favorite Quotes
> 

## Summary


## How I'll Apply This
- 
`
  },
  {
    id: 'recipe',
    name: 'Recipe',
    description: 'Save a recipe',
    icon: '🍳',
    content: `# Recipe

## Ingredients
- 
- 
- 

## Instructions
1. 
2. 
3. 

## Prep Time
- Prep: 
- Cook: 
- Total: 

## Servings


## Notes

`
  },
  {
    id: 'todo-list',
    name: 'To-Do List',
    description: 'Track tasks',
    icon: '✅',
    content: `# To-Do List

## 🔴 High Priority
- [ ] 

## 🟡 Medium Priority
- [ ] 

## 🟢 Low Priority
- [ ] 

## Completed
- [x] 
`
  },
  {
    id: 'weekly-review',
    name: 'Weekly Review',
    description: 'Reflect on your week',
    icon: '📊',
    content: `# Weekly Review

## Week of ${new Date().toLocaleDateString()}

## Wins 🎉
1. 
2. 
3. 

## Challenges
1. 
2. 

## Lessons Learned
- 

## Next Week's Priorities
1. 
2. 
3. 

## Metrics
- Notes created: 
- Tasks completed: 
`
  }
];
