import React from "react";
//yay we can use a functional one!
export default () => {
  return (
    <footer className="bg-dark text-white mt-5 text-center">
      Copyright &copy; {new Date().getFullYear()} DevConnector
    </footer>
  );
};
