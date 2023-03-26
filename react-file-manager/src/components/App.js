import AWS from "aws-sdk";
import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";

import jwt_decode from "jwt-decode";
import Header from "./Header";

const App = () => {
  const [userData, setUserData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [contents, setContents] = useState([]);

  
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
    const prefix = userData.sub + "/";
    const params = {
      Bucket: process.env.REACT_APP_AWSBucketname,
      Prefix: prefix,
    };
    s3.listObjects(params, (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      setContents(data.Contents);
    });
  };

  // Uploading file to S3 bucket
  const handleFileUpload = (event) => {
    event.preventDefault();
    const prefix = userData.sub + "/";

    s3.putObject(
      {
        //use env for bucket name
        Bucket: process.env.REACT_APP_AWSBucketname,
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
    document.getElementById("myFile").form.reset()
  };


  const handleFileDelete = async (event) =>{
 
  s3.deleteObject( {
    //use env for bucket name
    Bucket: process.env.REACT_APP_AWSBucketname,
    Key: event.target.name,
    //Body: selectedFile,
  },
  (err, data) => {
    if (err) {
      console.log(err);
    } else {
      listObjects();
      console.log(`Successfully Deleted ${event.target.name}`);
    }
  });
  }

  // Downloading file from S3 bucket
  const handleFileDownload = (event) => {
    event.preventDefault();
   
    s3.getObject(
      {
        //use env for variable
        Bucket: process.env.REACT_APP_AWSBucketname,
        Key: event.target.name,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          const url = window.URL.createObjectURL(new Blob([data.Body]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", event.target.name);
          document.body.appendChild(link);
          link.click();
        }
      }
    );
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
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
          </form>

          <p> {userData.name}'s Files:</p>

          <ol>
            {contents.map((obj) => {
              return (
                <div id="file-list"key={obj.Key}>
                  
                  <li>{obj.Key.split("/")[1]} </li>
                  <div id="btns">
                  <button name={obj.Key} onClick={handleFileDownload}>Download</button>
                  <button name={obj.Key} onClick={handleFileDelete}>Delete</button>
                  </div>
                 
                
                </div>
              );
            })}
          </ol>

        </div>
      )}
    </>
  );
};

export default App;
