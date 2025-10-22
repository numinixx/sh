import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../ui/LoadingSpinner';

const themeYellow = '#fcd116';
const themeBlue = '#2563eb';

interface GalleryImage {
	id: string;
	image_url: string;
	title: string;
	description?: string;
	display_order: number;
	is_active: boolean;
}

const Gallery: React.FC = () => {
	const [selected, setSelected] = useState<string | null>(null);
	const [images, setImages] = useState<GalleryImage[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadImages();
	}, []);

	const loadImages = async () => {
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from('gallery_images')
				.select('*')
				.eq('is_active', true)
				.order('display_order');

			if (error) {
				console.error('Error loading gallery images:', error);
				// Fallback to default images if database fails
				setImages([
					{ id: '1', image_url: 'https://www.ssaami.ac.in/home-photos/1-1024.jpeg', title: 'School Photo 1', display_order: 1, is_active: true },
					{ id: '2', image_url: 'https://www.ssaami.ac.in/home-photos/2-1024.jpeg', title: 'School Photo 2', display_order: 2, is_active: true },
					{ id: '3', image_url: 'https://www.ssaami.ac.in/home-photos/3-1024.jpeg', title: 'School Photo 3', display_order: 3, is_active: true },
					{ id: '4', image_url: 'https://www.ssaami.ac.in/home-photos/4-1024.jpeg', title: 'School Photo 4', display_order: 4, is_active: true },
					{ id: '5', image_url: 'https://www.ssaami.ac.in/home-photos/5-1024.jpeg', title: 'School Photo 5', display_order: 5, is_active: true },
					{ id: '6', image_url: 'https://www.ssaami.ac.in/home-photos/6-1024.jpeg', title: 'School Photo 6', display_order: 6, is_active: true },
					{ id: '7', image_url: 'https://www.ssaami.ac.in/home-photos/7-1024.jpeg', title: 'School Photo 7', display_order: 7, is_active: true },
					{ id: '8', image_url: 'https://www.ssaami.ac.in/home-photos/8-1024.jpeg', title: 'School Photo 8', display_order: 8, is_active: true },
				]);
			} else {
				setImages(data || []);
			}
		} catch (err) {
			console.error('Unexpected error loading images:', err);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div className="max-w-5xl mx-auto pt-24 pb-16 px-4">
			<h2 className="text-5xl font-extrabold mb-10 flex items-center justify-center gap-4 animate-fade-in">
				<img
					src="/assest/logo.png"
					alt="Logo"
					className="h-12 w-12 rounded-full shadow-lg border-4 border-yellow-300 bg-white"
				/>
				<span className="bg-gradient-to-r from-yellow-400 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
					Gallery
				</span>
			</h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{images.map((img, idx) => (
					<div
						key={img.id}
						className="rounded-xl overflow-hidden shadow-lg cursor-pointer border-4"
						style={{ borderColor: idx % 2 === 0 ? themeYellow : themeBlue }}
						onClick={() => setSelected(img.image_url)}
					>
						<img
							src={img.image_url}
							alt={img.title}
							className="w-full h-56 object-cover transition-transform duration-200 hover:scale-105"
						/>
						{img.description && (
							<div className="p-3 bg-white">
								<p className="text-sm text-gray-600 truncate">{img.description}</p>
							</div>
						)}
					</div>
				))}
			</div>

			{/* Modal for selected image */}
			{selected && (
				<div
					className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in"
					onClick={() => setSelected(null)}
				>
					<div
						className="bg-white rounded-2xl p-6 max-w-3xl w-full relative shadow-2xl border-4 border-blue-200"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							className="absolute top-3 right-3 text-3xl font-bold text-gray-700 hover:text-red-500 transition-colors"
							onClick={() => setSelected(null)}
						>
							&times;
						</button>
						<img
							src={selected}
							alt="Selected"
							className="w-full h-96 object-contain rounded-lg shadow-lg"
						/>
					</div>

					{/* User interaction: Upload suggestion */}
					<div
						className="mt-12 bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4"
						style={{ borderColor: themeYellow }}
					>
						<h3 className="text-2xl font-bold mb-2 text-gray-900">
							Want to see your school memories here?
						</h3>
						<p className="mb-4 text-gray-700">
							Suggest an image to add to our gallery! (Feature coming soon)
						</p>
						<button
							className="bg-themeBlue hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition-colors"
							style={{ background: themeBlue }}
							disabled
						>
							Suggest Image
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default Gallery;
