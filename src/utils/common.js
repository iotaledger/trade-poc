export const getNextUsers = (project, user, item, status) => {
  const nextUserRoles = [];
  Object.keys(project.events).forEach(role => {
    if (project.events[role] && project.events[role].previousEvent) {
      project.events[role].previousEvent.forEach(event => {
        if (event === status) {
          nextUserRoles.push(role);
        }
      });
    }
  });
  const newUsers = nextUserRoles.map(role => project.roleUserMapping[role]);
  return newUsers;
};
