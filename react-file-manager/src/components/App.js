import AWS from "aws-sdk";
import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";

import jwt_decode from "jwt-decode";
import Header from "./Header";

const App = () => {
  const [userData, setUserData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [contents, setContents] = useState([]);

  //move all the variables to env
  //Configuring AWS S3
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWSaccessKeyId,

    secretAccessKey: process.env.REACT_APP_AWSsecretAccessKey,
    region: process.env.REACT_APP_AWSregion,
  });

  const s3 = new AWS.S3();

  useEffect(() => {
    listObjects();
  }, [userData]);

  //Listing all files in the S3 bucket
  const listObjects = () => {
    console.log("listed again");
    const prefix = userData.sub + "/";
    const params = {
      Bucket: "ENTER_AWSBUCKETNAME",
      Prefix: prefix,
    };
    s3.listObjects(params, (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      //add else if error
      setContents(data.Contents);
    });
  };

  // Uploading file to S3 bucket
  const handleFileUpload = (event) => {
    event.preventDefault();
    const prefix = userData.sub + "/";

    console.log(selectedFile);

    s3.putObject(
      {
        //use env for bucket name
        Bucket: "ENTER_AWSBUCKETNAME",
        Key: prefix + selectedFile.name,
        Body: selectedFile,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          listObjects();
          console.log(`Successfully uploaded ${selectedFile.name}`);
        }
      }
    );
  };

  // Downloading file from S3 bucket
  const handleFileDownload = (event) => {
    event.preventDefault();
    //file = event.target.innerText;
    file = userData.sub + "/" + event.target.innerText;
    s3.getObject(
      {
        //use env for variable
        Bucket: "ENTER_AWSBUCKETNAME",
        Key: file,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
          const url = window.URL.createObjectURL(new Blob([data.Body]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", file);
          document.body.appendChild(link);
          link.click();
        }
      }
    );
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    console.log(e.target.files[0]);
  };

  const logout = () => {
    setUserData({});
    document.getElementById("login").hidden = false;
  };

  return (
    <>
      <Header name={userData.name} picLink={userData.picture} logout={logout} />

      <div id="login">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            var decoded = jwt_decode(credentialResponse.credential);
            setUserData(decoded);
            document.getElementById("login").hidden = true;
            console.log(process.env.REACT_APP_AWSaccessKeyId);
            console.log(process.env.REACT_APP_AWSsecretAccessKey);
          }}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      </div>

      {userData.sub && (
        <div id="body">
          <p>Please select file to upload.</p>
          <form>
            <input
              type="file"
              id="myFile"
              name="filename"
              onChange={handleFileChange}
            />
            <button type="submit" onClick={handleFileUpload}>
              Upload
            </button>
            {/* <input type="submit" value="download" onClick={handleFileDownload} /> */}
          </form>

          <p> {userData.name}'s Files:</p>
          
          <ul>
            {contents.map((obj) => (
              <li key={obj.Key} onClick={handleFileDownload}>
                {obj.Key.split("/")[1]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default App;
