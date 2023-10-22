import { useState } from "react";
import moment from "moment";
import "./App.scss";
import {
  statesData,
  ID,
  FULL_NAME,
  PHONE,
  EMAIL,
  AGE,
  EXPERIENCE,
  YEARLY_INCOME,
  HAS_CHILDREN,
  LICENSE_STATES,
  EXPIRATION_DATE,
  LICENSE_NUMBER,
  DUPLICATE_WITH,
  YEARLY_INCOME_MAX,
  AGE_MIN,
  dateFormats,
  hasChildren,
} from "./const";
import { formateYearlyIncome } from "./utils/formateYearlyIncome";
import { findDuplicatedIndex } from "./utils/findDuplicatedIndex";

function App() {
  const [users, setUsers] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const [errors, setErrors] = useState<boolean[][]>([]);
  const [fatalError, setFatalError] = useState<boolean>(false);

  const phoneSet = new Set<string>();
  const emailSet = new Set<string>();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        const file = e.target.files[0];
        const fileUrl = URL.createObjectURL(file);
        const response = await fetch(fileUrl);
        const text = await response.text();
        const lines = text.split("\n");

        const headerLine = lines[0];
        const usersLines = lines.slice(1);

        const headers = [ID, ...headerLine.split(","), DUPLICATE_WITH].map(
          (header) => header.trim()
        );
        setHeaders(headers);
        setUsers(() =>
          usersLines.map((userLine, uIndex) => [
            (uIndex + 1).toString(),
            ...userLine.split(","),
            "",
          ])
        );
        setUsers((prevUsers) => {
          return prevUsers.map((user, uIndex, users) => {
            setErrors((prevErrors) => [
              ...prevErrors,
              validateUser(user, uIndex, headers, users),
            ]);
            return user;
          });
        });
      } catch (error) {
        console.error(error);
      }
    }
    e.target.value = "";
    setFatalError(false);
  };

  const validateUser = (
    user: string[],
    uIndex: number,
    headers: string[],
    users: string[][]
  ) => {
    const errors: boolean[] = Array.from(
      { length: headers.length },
      () => false
    );

    user.forEach((cell, idx) => {
      const validCell = cell.trim();

      switch (headers[idx]) {
        case FULL_NAME:
          if (!validCell.length) setFatalError(true);
          break;

        case PHONE:
          const phoneRegex = /^(?:\+1\d{10}|1\d{10}|\d{10})$/;
          if (!validCell.length) setFatalError(true);
          else if (!phoneRegex.test(validCell)) {
            errors[idx] = true;
          } else {
            user[idx] = `+1${validCell.slice(-10)}`;
            if (phoneSet.has(validCell)) {
              errors[idx] = true;
              user[headers.indexOf(DUPLICATE_WITH)] = (
                findDuplicatedIndex(validCell, uIndex, idx, users) + 1
              ).toString();
            } else phoneSet.add(`+1${validCell.slice(-10)}`);
          }
          break;

        case EMAIL:
          const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
          if (!validCell.length) setFatalError(true);
          else if (!emailRegex.test(validCell)) {
            errors[idx] = true;
            break;
          }
          if (emailSet.has(validCell.toLowerCase())) {
            errors[idx] = true;
            user[headers.indexOf(DUPLICATE_WITH)] = (
              findDuplicatedIndex(validCell, uIndex, idx, users) + 1
            ).toString();
          } else emailSet.add(validCell.toLowerCase());
          break;

        case AGE:
          const age = parseInt(validCell, 10);
          if (isNaN(age) || age <= 0 || age < AGE_MIN) errors[idx] = true;
          break;

        case EXPERIENCE:
          const experience = parseInt(validCell, 10);
          if (
            isNaN(experience) ||
            experience < 0 ||
            experience > parseInt(user[headers.indexOf(AGE)], 10)
          ) {
            errors[idx] = true;
          }
          break;

        case YEARLY_INCOME:
          if (
            parseFloat(validCell) > YEARLY_INCOME_MAX ||
            parseFloat(validCell) < 0
          ) {
            errors[idx] = true;
          }
          user[headers.indexOf(YEARLY_INCOME)] = formateYearlyIncome(
            parseFloat(validCell).toFixed(2)
          );
          break;

        case HAS_CHILDREN:
          if (validCell === "") {
            user[idx] = "FALSE";
          } else if (!hasChildren.includes(validCell)) errors[idx] = true;
          break;

        case LICENSE_STATES:
          const parts = validCell.split("|").map((part) => part.trim());
          if (parts.length > 1) {
            const abbreviation =
              parts[0].length > 2
                ? parts[1].toUpperCase()
                : parts[0].toUpperCase();
            statesData.hasOwnProperty(abbreviation)
              ? (user[headers.indexOf(LICENSE_STATES)] = abbreviation)
              : (errors[idx] = true);
          } else {
            const state = parts[0];
            if (statesData.hasOwnProperty(state.toUpperCase())) {
              user[headers.indexOf(LICENSE_STATES)] = state.toUpperCase();
            } else {
              const matchedAbbr = Object.keys(statesData).find(
                (abbr) => statesData[abbr] === state
              );
              matchedAbbr
                ? (user[headers.indexOf(LICENSE_STATES)] = matchedAbbr)
                : (errors[idx] = true);
            }
          }
          break;

        case EXPIRATION_DATE:
          const isValidDate = dateFormats.some((format) =>
            moment(validCell, format, true).isValid()
          );
          if (!isValidDate || !moment(validCell).isBefore(moment()))
            errors[idx] = true;
          break;

        case LICENSE_NUMBER:
          const licenseRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{6}$/g;
          if (!licenseRegex.test(validCell)) errors[idx] = true;
          break;

        default:
          break;
      }
    });

    return errors;
  };

  return (
    <div className="wrapper">
      <input
        type="file"
        id="fileInput"
        className="wrapper_input__custom"
        accept=".csv"
        onChange={handleFileChange}
      />
      <label className="wrapper_input_label__custom" htmlFor="fileInput">
        Import users
      </label>
      {fatalError ? (
        <div className="error__fatal">
          <p>File format is incorrect</p>
        </div>
      ) : headers.length && users.length && errors.length ? (
        <div className="wrapper_table">
          <table>
            <thead>
              <tr>
                {headers?.map((header, i) => (
                  <th key={i}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users?.map((rowData, idx) => {
                return (
                  <tr key={idx}>
                    {rowData?.map((data, i) => {
                      return (
                        <td key={i} className={errors[idx]?.[i] ? "error" : ""}>
                          {data}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No CSV file selected.</p>
      )}
    </div>
  );
}

export default App;
