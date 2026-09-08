import { useState } from "react";
import { splitBill } from "./splitBill";

function UploadBill() {
  const [file, setFile] = useState(null);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [people, setPeople] = useState([]);
  const [newPersonName, setNewPersonName] = useState("");
  const [assignments, setAssignments] = useState({});

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setBill(null);
    setError(null);
    setAssignments({});
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/extract-bill", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Request failed: ${response.status}`);
      }
      const data = await response.json();
      setBill(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPerson = () => {
    const name = newPersonName.trim();
    if (!name || people.includes(name)) return;
    setPeople([...people, name]);
    setNewPersonName("");
  };

  const toggleAssignment = (itemIdx, personName) => {
    setAssignments((prev) => {
      const current = prev[itemIdx] || [];
      const updated = current.includes(personName)
        ? current.filter((n) => n !== personName)
        : [...current, personName];
      return { ...prev, [itemIdx]: updated };
    });
  };

  const split = bill && people.length > 0 ? splitBill(bill, assignments) : null;

  return (
    <div>
      <div className="section">
        <h2>Upload a bill</h2>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!file || loading}>
          {loading ? "Reading..." : "Extract Bill"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {bill && (
        <>
          <hr className="divider" />
          <div className="section">
            <h2>Items</h2>
            <table>
              <tbody>
                {bill.items.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`item-row ${item.confidence < 0.85 ? "low-confidence" : ""}`}
                  >
                    <td>{item.name}</td>
                    <td style={{ textAlign: "right" }}>×{item.quantity}</td>
                    <td style={{ textAlign: "right" }}>₹{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: "0.75rem" }}>
              <div className="total-line"><span>Subtotal</span><span>₹{bill.subtotal}</span></div>
              <div className="total-line"><span>Tax</span><span>₹{bill.tax}</span></div>
              <div className="total-line"><span>Service</span><span>₹{bill.service_charge}</span></div>
              <div className="total-line"><span>Discount</span><span>-₹{bill.discount}</span></div>
              <div className="total-line grand"><span>Total</span><span>₹{bill.total}</span></div>
            </div>
          </div>

          <hr className="divider" />
          <div className="section">
            <h2>Who's splitting this?</h2>
            <input
              type="text"
              placeholder="Enter a name"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPerson()}
            />
            <button onClick={addPerson}>Add</button>
          </div>

          {people.length > 0 && (
            <>
              <hr className="divider" />
              <div className="section">
                <h2>Assign items</h2>
                <table>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>Item</th>
                      {people.map((p) => (
                        <th key={p}>{p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        {people.map((p) => (
                          <td key={p} style={{ textAlign: "center" }}>
                            <input
                              type="checkbox"
                              checked={(assignments[idx] || []).includes(p)}
                              onChange={() => toggleAssignment(idx, p)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {split && (
            <>
              <hr className="divider" />
              <div className="section">
                <h2>Split summary</h2>
                {Object.entries(split).map(([name, s]) => (
                  <div key={name} className="person-block">
                    <strong>{name}</strong>
                    <div className="total-line"><span>Items</span><span>₹{s.itemsTotal.toFixed(2)}</span></div>
                    <div className="total-line"><span>Tax</span><span>₹{s.taxShare.toFixed(2)}</span></div>
                    <div className="total-line"><span>Service</span><span>₹{s.serviceShare.toFixed(2)}</span></div>
                    <div className="total-line grand"><span>Owes</span><span>₹{s.total.toFixed(2)}</span></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default UploadBill;