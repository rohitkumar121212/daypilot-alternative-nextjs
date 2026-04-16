import Image from 'next/image'
const HeaderLogo = () => {
  return (
    <div className="shrink-0">
        <Image 
            src="https://aperfectstay.ai/static/images/logo_image.png" 
            alt="A Perfect Stay" 
            width={100} 
            height={30}
            className="w-auto shrink-0"
        />
    </div>
  );
}
export default HeaderLogo