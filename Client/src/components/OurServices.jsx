import React from "react";
import { Link } from "react-router-dom";

const OurServices = () => {
  return (
    <div className="p-16 bg-gradient-to-br from-gray-900 to-gray-700">
      <div className="w-full flex justify-center items-center mb-12">
        <h1 className="text-3xl font-bold uppercase">Our Services</h1>
      </div>
      <div className="flex flex-col lg:flex-row justify-center items-center gap-10">
        <div className="card w-80 md:w-96 bg-base-100 shadow-xl">
          <figure>
            <img
              src="/images/student.png"
              alt="student"
              height={300}
              width={300}
              className="rounded-md mt-6"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">Student</h2>
            <p>You can apply for verification.</p>
            <div className="card-actions justify-end">
              <Link to="/student" className="btn btn-primary">
                Go to Student Panel
              </Link>
            </div>
          </div>
        </div>

        <div className="card w-80 md:w-96 bg-base-100 shadow-xl">
          <figure>
            <img
              src="/images/primary-verifier.png"
              alt="primary-verifier"
              height={300}
              width={300}
              className="rounded-md mt-6"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">Primary Verifier</h2>
            <p>You can do primary verification of certificates</p>
            <div className="card-actions justify-end">
              <Link to="/primary-verifier" className="btn btn-primary">
                Go to Primary Verifier Panel
              </Link>
            </div>
          </div>
        </div>

        <div className="card w-80 md:w-96 bg-base-100 shadow-xl">
          <figure>
            <img
              src="/images/secondary-verifier.png"
              alt="Shoes"
              height={270}
              width={270}
              className="rounded-md mt-6"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">Secondary Verifier</h2>
            <p>You can do secondary verification of certificates</p>
            <div className="card-actions justify-end">
              <Link to="/secondary-verifier" className="btn btn-primary">
                Go to Secondary Verifier Panel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurServices;
