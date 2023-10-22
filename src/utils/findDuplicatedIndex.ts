export const findDuplicatedIndex = (
  currentCell: string,
  currentUserIndex: number,
  headerIndex: number,
  users: string[][]
) => {
  return users.findIndex((user, index) => {
    return (
      index < currentUserIndex &&
      user[headerIndex].toLowerCase() === currentCell.toLowerCase()
    );
  });
};
