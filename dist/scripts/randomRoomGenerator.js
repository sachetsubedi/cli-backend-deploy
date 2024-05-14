function generateRandomRoomName() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let randomRoomName = '';

  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    randomRoomName += letters[randomIndex];
  }

  return randomRoomName;
}
export default generateRandomRoomName;