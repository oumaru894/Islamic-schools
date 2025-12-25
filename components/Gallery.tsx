// gallery component that displays a grid of images. when a summery prop is passed, it shows only a few images with a "View More" link. when the link is onClicked, it should navigate to a dedicated gallery page for the school.
// when no summery prop is passed, it shows some images in a grid with pagination controls at the bottom.
// It should accept props for the school id to fetch images, and an optional summery boolean prop.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSchoolById } from '../services/api';
//import { SchoolImage } from '../types';

// school image type
export interface SchoolImage {
  id: string;
  url: string;
  caption?: string;
}


// sample images data
const sampleImages: SchoolImage[] = [
    { id: '1', url: 'https://picsum.photos/800/600?random=19', caption: 'School Building' },
    { id: '2', url: 'https://picsum.photos/800/600?random=20', caption: 'Classroom' },
    { id: '3', url: 'https://picsum.photos/800/600?random=21', caption: 'Playground' },
    { id: '4', url: 'https://picsum.photos/800/600?random=22', caption: 'Library' },
    { id: '5', url: 'https://picsum.photos/800/600?random=23', caption: 'Laboratory' },
    { id: '6', url: 'https://picsum.photos/800/600?random=24', caption: 'Sports Field' },
    { id: '7', url: 'https://picsum.photos/800/600?random=25', caption: 'Cafeteria' },
    { id: '8', url: 'https://picsum.photos/800/600?random=26', caption: 'Auditorium' },
    { id: '9', url: 'https://picsum.photos/800/600?random=27', caption: 'Science Fair' },
    { id: '10', url: 'https://picsum.photos/800/600?random=28', caption: 'Art Class' },
    { id: '11', url: 'https://picsum.photos/800/600?random=29', caption: 'Music Room' },
    { id: '12', url: 'https://picsum.photos/800/600?random=30', caption: 'Sports Day' },
    { id: '13', url: 'https://picsum.photos/800/600?random=31', caption: 'Graduation Ceremony' },
    { id: '14', url: 'https://picsum.photos/800/600?random=32', caption: 'Field Trip' },
    { id: '15', url: 'https://picsum.photos/800/600?random=33', caption: 'Student Council' },
];


interface GalleryProps {
  schoolId: string;
  summary?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ schoolId, summary = false }) => {
  const [images, setImages] = useState<SchoolImage[]>(sampleImages || []);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 6;

  useEffect(() => {
    let mounted = true;
    fetchSchoolById(schoolId)
      .then((s: any) => {
        if (!mounted) return;
        const g = (s.gallery || []) as any[];
        if (g && g.length > 0) setImages(g.map(i => ({ id: String(i.id), url: i.url, caption: i.caption })));
        else setImages(sampleImages);
      })
      .catch(err => {
        console.error('Error fetching school or gallery:', err);
        if (mounted) setImages(sampleImages);
      });
    return () => { mounted = false; };
  }, [schoolId]);

  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = summary ? images.slice(0, 4) : images.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil(images.length / imagesPerPage);

  const handleClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  // if summary is false, the size of the text "Gallery" should be very large and bold and should be center and underline.
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className={`text-2xl font-bold mb-6 ${!summary ? 'text-center underline text-4xl' : ''}`}>Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {currentImages.map((image) => (
          <div key={image.id} className="rounded-lg overflow-hidden shadow-lg">
            <img src={image.url} alt={image.caption || 'School Image'} className="w-full h-48 object-cover" />
            {image.caption && <div className="p-2 text-sm text-gray-600">{image.caption}</div>}
          </div>
        ))}
      </div>
      {summary ? (
        <div className="mt-6 text-center">
          <Link to={`/school/${schoolId}/gallery`} className="text-emerald-700 font-medium hover:underline">
            View More →
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handleClick(pageNumber)}
              className={`px-3 py-1 rounded ${currentPage === pageNumber ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;