

export const registerFromControls = [
    {
        name :"username",
        label: "User Name",
        placeholder: "Enter your username",
        componentType: "input",
        type: "text",
    },
    {
        name : "email",
        label: "Email",
        placeholder: "Enter your email",
        componentType: "input",
        type: "email",
    },
    {
        name: "password",
        label: "Password",
        placeholder: "Enter your password",
        componentType: "input",
        type: "password",
    },    
];
export const loginFromControls = [
    {
        name :"email",
        label: "Email",
        placeholder: "Enter your email",
        componentType: "input",
        type: "email",
    },
    {
        name: "password",
        label: "Password",
        placeholder: "Enter your password",
        componentType: "input",
        type: "password",
    },

];  

export const forgetPasswordFormConytrols =[
      {
        name :"email",
        label: "Email",
        placeholder: "Enter your email",
        componentType: "input",
        type: "email",
    },
]

export const addressFormControls  = [
    {
        name : "address",
        label : "Address",
        placeholder: "Enter your address",
        type: "text",
        componentType: "input"
    },
    {
        name : "city",
        label: "City",
        placeholder : "Enter your City name",
        componentType : "input",
        type : "text"
    },
    {
         name : "pincode",
        label: "Pincode",
        placeholder : "Enter your pincode",
        componentType : "input",
        type : "text"
    },
    {
         name : "phone",
        label: "Phone",
        placeholder : "Enter your phone number",
        componentType : "input",
        type : "text"
    },
    {
         name : "notes",
        label: "Notes",
        placeholder : "Enter your additional notes ",
        componentType : "textarea",
        type : "text"
    }
];

// options for pricing high to low or low to high

export const sortOptions = [
    {
        id : "price-hightolow",
        label : "Price : High to Low"
    },
    {
        id : "price-lowtohigh",
        label : "Price : Low to High",
    },
    {
        id : "title-atoz",
        title : "Title : A to Z", 
    },
    {
        id : "title-ztoa",
        title : "Title : Z to A"
    }
];

export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/shop/home",
  },
  {
    id: "products",
    label: "Products",
    path: "/shop/listing",
  },
  {
    id: "men",
    label: "Men",
    path: "/shop/listing",
  },
  {
    id: "women",
    label: "Women",
    path: "/shop/listing",
  },
  {
    id: "kids",
    label: "Kids",
    path: "/shop/listing",
  },
  {
    id: "footwear",
    label: "Footwear",
    path: "/shop/listing",
  },
  {
    id: "accessories",
    label: "Accessories",
    path: "/shop/listing",
  },
  {
    id: "search",
    label: "Search",
    path: "/shop/search",
  },
];
 //category list
export const categoryOptionsMap = {
  men: "Men",
  women: "Women",
  kids: "Kids",
  accessories: "Accessories",
  footwear: "Footwear",
};
 // brand option
export const brandOptionsMap = {
  nike: "Nike",
  adidas: "Adidas",
  puma: "Puma",
  levi: "Levi",
  zara: "Zara",
  "h&m": "H&M",
};
 // filter option
export const filterOptions = {
  category: [
    { id: "men", label: "Men" },
    { id: "women", label: "Women" },
    { id: "kids", label: "Kids" },
    { id: "accessories", label: "Accessories" },
    { id: "footwear", label: "Footwear" },
  ],
  brand: [
    { id: "nike", label: "Nike" },
    { id: "adidas", label: "Adidas" },
    { id: "puma", label: "Puma" },
    { id: "levi", label: "Levi's" },
    { id: "zara", label: "Zara" },
    { id: "h&m", label: "H&M" },
  ],
};
  // add product form
export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      { id: "men", label: "Men" },
      { id: "women", label: "Women" },
      { id: "kids", label: "Kids" },
      { id: "accessories", label: "Accessories" },
      { id: "footwear", label: "Footwear" },
    ],
  },
  {
    label: "Brand",
    name: "brand",
    componentType: "select",
    options: [
      { id: "nike", label: "Nike" },
      { id: "adidas", label: "Adidas" },
      { id: "puma", label: "Puma" },
      { id: "levi", label: "Levi's" },
      { id: "zara", label: "Zara" },
      { id: "h&m", label: "H&M" },
    ],
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
  },
  {
    label: "Sale Price",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter sale price (optional)",
  },
  {
    label: "Total Stock",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter total stock",
  },
];

