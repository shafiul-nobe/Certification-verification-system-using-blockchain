import React, { useState } from "react";
import axios from "axios";
import erc20ABI from "../config/erc20ABI.json";
import { ethers } from "ethers";
import ethereumConfig from "../config/ethereum";

function ApplyForVerification() {
  const [inputs, setInputs] = useState({
    _serialNumber: "",
    _studentName: "",
    _studentId: "",
    _graduationDate: "",
    _dateOfBirth: "",
    _institutionId: "",
    _programId: "",
  });

  const [imageUrl, setImageUrl] = useState("");
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setUploadPercentage(0);
    setImageUrl("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: "2ac2736cbfe1582ceb44",
            pinata_secret_api_key:
              "5024c7a3beb02b3c9fca0e95fe73ef569f9e8ddcedaca629cce70c8d0cefc7dd",
          },
          onUploadProgress: (progressEvent) => {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadPercentage(percentage);
          },
        }
      );
      setImageUrl(
        `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
      );
    } catch (error) {
      console.error("Error uploading image to IPFS:", error);
    }
  };

  const handleInputChange = (e) => {
    setInputs((s) => ({
      ...s,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageUrl.length === 0) {
      return alert("Please select an image");
    }
    try {
      const data = {
        ...inputs,
        _ipfsUrl: imageUrl,
      };

      if (!window.ethereum) return alert("Please Install MetaMask!");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      // console.log(signer);
      const erc20 = new ethers.Contract(
        ethereumConfig.address,
        erc20ABI,
        signer
      );

      const res = await erc20.applyForVerification(
        data._serialNumber,
        10,
        data._studentId,
        data._graduationDate,
        data._dateOfBirth,
        data._programId,
        data._institutionId,
        data._ipfsUrl,
        {
          gasLimit: "3000000",
        }
      );
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="px-10 pt-6 pb-10">
      <div>
        <div className="w-full flex justify-center items-center mb-6">
          <h1 className="text-2xl font-semibold">Apply For Verification</h1>
        </div>
        <form className="flex justify-center items-center">
          <div className="grid grid-cols-2 gap-4 w-1/2">
            <div className="col-span-2">
              <div className="bg-gray-700 h-40 rounded mb-2 border-2 border-dashed border-gray-400 flex justify-center items-center">
                {imageUrl ? (
                  <img src={imageUrl} className="h-[140px] rounded shadow" />
                ) : (
                  "Select an image"
                )}
              </div>
              <input
                type="file"
                className="file-input file-input-bordered file-input-primary w-full"
                accept="image/*"
                onChange={handleFileChange}
              />
              {uploadPercentage === 0 ? null : (
                <progress
                  className="progress progress-primary w-full"
                  value={uploadPercentage}
                  max="100"
                ></progress>
              )}
            </div>
            <div className="flex flex-col justify-start items-start gap-2">
              <label>Serial Number:</label>
              <input
                type="text"
                placeholder="Serial Number"
                className="input input-bordered input-primary w-full"
                name="_serialNumber"
                value={inputs._serialNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col justify-start items-start gap-2">
              <label>Student Name:</label>
              <input
                type="text"
                placeholder="Student Name"
                className="input input-bordered input-primary w-full"
                name="_studentName"
                value={inputs._studentName}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col justify-start items-start gap-2">
              <label>Student ID:</label>
              <input
                type="text"
                placeholder="Student ID"
                className="input input-bordered input-primary w-full"
                name="_studentId"
                value={inputs._studentId}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col justify-start items-start gap-2">
              <label>Graduation Date:</label>
              <input
                type="text"
                placeholder="mm/yyyy"
                className="input input-bordered input-primary w-full"
                name="_graduationDate"
                value={inputs._graduationDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col justify-start items-start gap-2">
              <label>Date of Birth:</label>
              <input
                type="text"
                placeholder="yyyy-mm-dd"
                className="input input-bordered input-primary w-full"
                name="_dateOfBirth"
                value={inputs._dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col justify-start items-start gap-2">
              <label>Select Your Program:</label>
              <select
                className="select select-primary w-full"
                name="_programId"
                value={inputs._programId}
                onChange={handleInputChange}
              >
                <option value={undefined}>Select Your Program</option>
                <option value={1}>A</option>
                <option value={2}>B</option>
                <option value={3}>C</option>
                <option value={4}>D</option>
              </select>
            </div>
            <div className="flex flex-col justify-start items-start gap-2">
              <label>Select Your Institute:</label>
              <select
                className="select select-primary w-full"
                name="_institutionId"
                value={inputs._institutionId}
                onChange={handleInputChange}
              >
                <option value={undefined}>Select Your Institute</option>
                <option value={1}>A</option>
                <option value={2}>B</option>
                <option value={3}>C</option>
                <option value={4}>D</option>
              </select>
            </div>
            <div className="col-span-2">
              <button onClick={handleSubmit} className="btn btn-primary w-full">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplyForVerification;
