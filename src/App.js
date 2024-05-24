import { useState } from "react";
const initialFriends = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118836",
    balance: -7,
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 20,
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0,
  },
];

function Button({ onClick, children }) {
  //console.log("Button onClick", onClick);
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}

export default function App() {
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friends, setFriends] = useState(initialFriends);
  const [selectedFriend, setSelectedFriend] = useState(null);

  function handleAddFriendClick() {
    setShowAddFriend((show) => !show);
    setSelectedFriend(null);
  }

  function handleSelection(friend) {
    setSelectedFriend((curSelFriend) =>
      friend.id !== curSelFriend?.id ? friend : null
    );
    setShowAddFriend(false);
  }

  function addFriend(friend) {
    setFriends((friends) => [...friends, friend]);
    setShowAddFriend(false);
  }

  function handleSplitBill(billValue, yourExpense, whoPays) {
    let newBalance;
    if (whoPays === "user") {
      newBalance = selectedFriend.balance + (billValue - yourExpense);
    } else {
      newBalance = selectedFriend.balance - yourExpense;
    }
    setFriends((friends) =>
      friends.map((f) => {
        if (f !== selectedFriend) return f;
        return { ...f, balance: newBalance };
      })
    );
    setSelectedFriend(null);
    //console.log(newBalance);
  }

  //  console.log(showSplitBill);
  return (
    <div className="app">
      <div className="sidebar">
        <FriendList
          friends={friends}
          onSelection={handleSelection}
          selectedFriend={selectedFriend}
        />
        {showAddFriend && <FormAddFriend addFriend={addFriend} />}
        <Button onClick={handleAddFriendClick}>
          {showAddFriend ? "Close" : "Add Friend"}
        </Button>
      </div>
      {selectedFriend && (
        <FormSplitBill
          selectedFriend={selectedFriend}
          onSplitBill={handleSplitBill}
        />
      )}
    </div>
  );
}

function FriendList({ friends, onSelection, selectedFriend }) {
  //  console.log("FriendList onSelectFriend", onSelectFriend);
  return (
    <ul>
      {friends.map((f) => {
        return (
          <FriendItem
            key={f.id}
            friend={f}
            onSelection={onSelection}
            selectedFriend={selectedFriend}
          >
            {f.name}
          </FriendItem>
        );
      })}
    </ul>
  );
}

function FriendItem({ friend, children, onSelection, selectedFriend }) {
  const isSelected = selectedFriend && friend.id === selectedFriend.id;
  return (
    <li className={isSelected ? "selected" : ""}>
      <img className="picture" alt={children} src={friend.image} />
      <h3>{children}</h3>
      {friend.balance < 0 && (
        <p className="red">
          You owe {children} {Math.abs(friend.balance)}
        </p>
      )}
      {friend.balance === 0 && <p>You and {children} are even</p>}
      {friend.balance > 0 && (
        <p className="green">
          {children} owes you {Math.abs(friend.balance)}
        </p>
      )}
      <Button className="button" onClick={() => onSelection(friend)}>
        {isSelected ? "Close" : "Select"}
      </Button>
    </li>
  );
}

function FormAddFriend({ addFriend }) {
  const [friendName, setFriendName] = useState("");
  const [imageUrl, setImageUrl] = useState("https://i.pravatar.cc/48");
  function handleSubmit(e) {
    e.preventDefault();
    if (!(friendName && imageUrl)) return;
    const id = crypto.randomUUID();
    const newFriend = {
      id,
      name: friendName,
      image: `${imageUrl}?=${id}`,
      balance: 0,
    };
    setFriendName("");
    setImageUrl("https://i.pravatar.cc/48");
    addFriend(newFriend);
  }
  function handleChange(target, value) {
    target === "name" && setFriendName(value);
    target === "imageUrl" && setImageUrl(value);
  }

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label>👥Friend name</label>
      <input
        type="text"
        value={friendName}
        onChange={(e) => handleChange("name", e.target.value)}
      />
      <label>🖼 Image URL</label>
      <input
        type="text"
        value={imageUrl}
        onChange={(e) => handleChange("imageUrl", e.target.value)}
      />
      <Button>Add</Button>
    </form>
  );
}

function FormSplitBill({ selectedFriend, onSplitBill }) {
  //console.log("FormSplitBill selectedFriend=", selectedFriend);
  const [billValue, setBillValue] = useState(0);
  const [yourExpense, setYourExpense] = useState(0);
  const [whoPays, setWhoPays] = useState("user");
  const friendsExpense = billValue - yourExpense;
  function handleSubmit(e) {
    e.preventDefault();

    onSplitBill(billValue, yourExpense, whoPays);

    setBillValue(0);
    setYourExpense(0);
    setWhoPays("user");
  }

  // man muss nicht über eine handleChange Funktion gehen, wenn man eigentlich nur die setState-Funktion aufruft ...
  function handleChange(target, value) {
    target === "billValue" && setBillValue(value);
    target === "yourExpense" && setYourExpense(value);
    target === "whoPays" && setWhoPays(value);
  }
  return (
    <form className="form-split-bill" onSubmit={handleSubmit}>
      <h2>Split a bill with {selectedFriend.name}</h2>
      <label>💰Bill value</label>
      <input
        type="numeric"
        value={billValue}
        name="billValue"
        onChange={(e) => setBillValue(Number(e.target.value))}
        // spart den Umweg über handleChange
        // onChange={(e) => handleChange("billValue", e.target.value)}
      />
      <label>👤Your expense</label>
      <input
        type="numeric"
        name="yourExpense"
        value={yourExpense}
        onChange={(e) =>
          setYourExpense(
            Number(e.target.value) > billValue
              ? yourExpense
              : Number(e.target.value)
          )
        }
        // wenn der eigene Betrag größer als die Gesamtrechnung ist, wird der State nicht aktualisiert ...
        // onChange={(e) => handleChange("yourExpense", e.target.value)}
      />
      <label>👥{selectedFriend.name}'s expense</label>
      <input
        type="numeric"
        disabled
        value={friendsExpense}
        name="friendsExpense"
      />
      <label>💶Who is paying the bill</label>
      <select
        value={whoPays}
        name="whoPays"
        onChange={(e) => setWhoPays(e.target.value)}
        // onChange={(e) => handleChange("whoPays", e.target.value)}
      >
        <option value="user">You</option>
        <option value="friend">{selectedFriend.name}</option>
      </select>
      <Button>Split bill</Button>
    </form>
  );
}
