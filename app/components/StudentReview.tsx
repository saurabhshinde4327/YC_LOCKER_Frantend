import React from "react";

type Review = {
  name: string;
  review: string;
};

const StudentReview: React.FC = () => {
  const reviews: Review[] = [
    {
      name: "Aditi Rajemahadik",
      review: "YCISLocker helps me keep all my documents safe and easy to access whenever I need them.",
    },
    {
      name: "Sahil Kenjale",
      review: "It’s so convenient to have my marksheets and certificates stored in one place with YCISLocker.",
    },
    {
      name: "Arya Chavan",
      review: "Before YCISLocker, I kept losing track of my certificates. Now I just upload them once, and they’re always there when I need them for college forms or scholarship stuff. Super easy to use too!",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-black">
        What Our Students Say
      </h2>
      <p className="text-center mb-10 text-gray-600">
        Hear directly from students who have benefited from our platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
          >
            <p className="text-gray-700 italic">“{r.review}”</p>
            <div className="mt-4 text-right font-semibold text-indigo-600">
              – {r.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentReview;
