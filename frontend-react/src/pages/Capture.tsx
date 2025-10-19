import { useState } from "react";
import { ODLCObjects, DetectedObject } from "../protos/onboarding.pb";
const Capture = () => {
  const [allImages, setAllImages] = useState([] as string[]);
  const [error, setError] = useState("");
  const [selectedclass, setClass] = useState("");
  const [classifcationStatus, setStatus] = useState("");
  return (
    <div>
      <button
        onClick={async () => {
          let response = await fetch("/api/v1/obc/capture");
          if (response.status != 200) {
            setError(await response.text());
          }
          setError("");
          let resdata = await response.text();
          let set = [resdata, ...allImages];
          setAllImages(set);
        }}
      >
        Get Image
      </button>
      <ol
        style={{
          display: "flex",
          maxWidth: "90vw",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "100vw",
            display: "flex",
          }}
        >
          <img
            style={{
              height: "30vh",
              objectFit: "cover",
            }}
            src={`data:image/jpeg;base64,${allImages[0]}`}
            datatype="base64"
          ></img>
          <div>
            <select
              onChange={(e) => {
                setClass(e.target.value);
              }}
            >
              {Object.entries(ODLCObjects).map((e) => {
                if (!isNaN(+e[1])) {
                  return; //skip number
                }
                return <option>{e[1]}</option>;
              })}
            </select>
            <button
              onClick={async () => {
                let index = -1;
                let entries = Object.entries(ODLCObjects);
                for (let i = 0; i < entries.length; i++) {
                  if (entries[i][0] === selectedclass) {
                    index = parseInt(entries[i][1] as any); //any cast because the array has both [index, name] and [name, index]
                  }
                }
                let selectedObject = DetectedObject.create({
                  selectedObject: index,
                });
                console.log(`sent ${selectedObject}`);
                let res = await fetch("/api/v1/obc/message", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(DetectedObject.toJSON(selectedObject)),
                });
                let status = await res.json();
                setStatus(status["upstream_body"])
                let newimages = ["", ...allImages ]
                setAllImages(newimages)
              }}
            >
              Submit
            </button>
          </div>
        </div>
        <hr
          style={{
            border: "1px black soild",
            width: "100vw",
          }}
        ></hr>
        {allImages.map((e) => {
          if(e ==""){
            return <></>
          }
          return (
            <li>
              <img
                style={{
                  height: "10vh",
                }}
                src={`data:image/jpeg;base64,${e}`}
                datatype="base64"
              ></img>
            </li>
          );
        })}
      </ol>
      {error != "" && (
        <h2
          style={{
            color: "red",
          }}
        >
          {error}
        </h2>
      )}
      {classifcationStatus != "" && (
        <h2
          style={{
            color: "",
          }}
        >
          Image guess:{classifcationStatus}
        </h2>
      )}
    </div>
  );
};
export default Capture;
