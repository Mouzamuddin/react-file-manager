const Header = ({ name, picLink, logout }) => {
  return (
    <div id="header">
      <div>
        <h1>FileDrive</h1>
      </div>
      <div className="user-data">
        <img src={picLink}></img>
        <p>
          <strong>{name}</strong>
        </p>
      </div>
      {name && (
        <button onClick={logout} id="logoutBtn">
          Logout
        </button>
      )}
    </div>
  );
};

export default Header;
