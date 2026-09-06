
export default function Cards({item, selectHandle}) {

  return (
    <div className="group rounded-2xl w-full overflow-hidden aspect-[4/3] shadow relative">
      <div className="absolute z-10 bg-black/50 text-white px-4 m-2 rounded-4xl bottom-0">
        {name}
      </div>
      <img
        src={item.images[0]}
        alt={item.name}
        className="object-cover w-full h-full z-0 relative"
      />

      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
          <button className="bg-black text-white w-1/3 py-1 rounded-4xl cursor-pointer"
                  onClick={()=> selectHandle(item.id)}
          >
            Select
          </button>
          <button className="bg-black text-white w-1/3 py-1 rounded-4xl cursor-pointer">More</button>
        </div>
      </div>
    </div>
  );
}
