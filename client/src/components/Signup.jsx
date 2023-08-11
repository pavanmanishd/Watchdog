// import React, { useState } from "react";
// import config from "../config/index";
// import styles from "../styles/Login.module.css"; // You can reuse the Login styles

// export default function Signup() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [email, setEmail] = useState("");

//   const signupUser = async (e) => {
//     e.preventDefault();
//     const response = await fetch(`${config.api}/signup`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         username,
//         email,
//         password,
//       }),
//     });
//     const data = await response.json();
//     if (data.status === true) {
//       window.location.href = "/login";
//     } else {
//       alert("Signup Failed : please check your email and password");
//     }
//   };

//   return (
//     <div className={styles.body}>
//       <div className={styles.container}>
//         <div className={styles.login_box}> {/* Reuse the login_box styles */}
//           <h1 className={styles.heading}>Signup</h1> {/* Reuse the heading styles */}
//           <form onSubmit={signupUser}>
//             <div className={styles.input_group}>
//               <label htmlFor="username" className={styles.label}>
//                 Username
//               </label>
//               <input
//                 type="text"
//                 placeholder="Username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 className={styles.input_field} 
//               />
//             </div>
//             <div className={styles.input_group}> 
//               <label htmlFor="email" className={styles.label}>
//                 Email
//               </label>
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className={styles.input_field} 
//               />
//             </div>
//             <div className={styles.input_group}> {/* Reuse the input_group styles */}
//               <label htmlFor="password" className={styles.label}>
//                 Password
//               </label>
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className={styles.input_field}
//               />
//             </div>
//             <button type="submit" className={styles.btn}>
//               Signup
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState } from "react";
import config from "../config/index";
import "../styles/Auth.styles.css"; // Import the shared styles

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const signupUser = async (e) => {
    e.preventDefault();
    const response = await fetch(`${config.api}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });
    const data = await response.json();
    if (data.status === true) {
      window.location.href = "/login";
    } else {
      alert("Signup Failed : please check your email and password");
    }
  };

  return (
    <div className="container1">
      <div className="container">
        <div className="github-logo">
          <i className="fa-brands fa-github"></i>
        </div>
        <h1 className="github-head">Signup</h1>
        <div className="login-wrapper">
          <form onSubmit={signupUser}>
            <div className="input-box">
              <div className="input-label">Username</div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="input-box">
              <div className="input-label">Email</div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-box">
              <div className="input-label">
                <span>Password</span>
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="submit-btn">
              Signup
            </button>
          </form>
        </div>
        <div className="info">
          <span>
            Already have an account? <a href="/login/">Login.</a>
          </span>
        </div>
      </div>
    </div>
  );
}
