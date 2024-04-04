import React from "react";
import { Link } from "react-router-dom";

const OurServices = () => {
  return (
    <div className="p-16 bg-gradient-to-br from-gray-900 to-gray-700">
      <div className="w-full flex justify-center items-center mb-12">
        <h1 className="text-4xl font-semibold">Our Services</h1>
      </div>
      <div className="flex justify-center items-center gap-10">
        <div className="card w-96 bg-base-100 shadow-xl">
          <figure>
            <img src="/images/Applicant.jpg" alt="Shoes" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">Verification</h2>
            <p>You can apply for verification.</p>
            <div className="card-actions justify-end">
              <Link to="/applicant" className="btn btn-primary">
                Apply
              </Link>
            </div>
          </div>
        </div>

        {/* <div className="card w-96 bg-base-100 shadow-xl">
          <figure>
            <img
              src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
              alt="Shoes"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">Shoes!</h2>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Buy Now</button>
            </div>
          </div>
        </div>

        <div className="card w-96 bg-base-100 shadow-xl">
          <figure>
            <img
              src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
              alt="Shoes"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">Shoes!</h2>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Buy Now</button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default OurServices;
