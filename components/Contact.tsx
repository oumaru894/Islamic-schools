import React, { useState } from 'react';
import { School } from '../types';
import { MapPin, Mail, Phone, Globe } from 'lucide-react';

interface Props {
	school?: School | null;
}

const Contact: React.FC<Props> = ({ school = null }) => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [address, setAddress] = useState(school?.contact.address || '');
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const recipient = school?.contact?.email || '';

	const mapAddress = address || school?.contact.address || '';
	const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`;

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setSuccess(null);

		if (!name.trim() || !message.trim()) {
			setError('Please provide your name and message.');
			return;
		}

		const payload = {
			schoolId: school?.id,
			name,
			email,
			address,
			message,
		};

		setLoading(true);
		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				setSuccess('Message sent — we will get back to you shortly.');
				setName('');
				setEmail('');
				setMessage('');
			} else {
				const mailto = `mailto:${recipient || ''}?subject=${encodeURIComponent('Contact via School Directory')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nAddress: ${address}\n\n${message}`)}`;
				window.location.href = mailto;
			}
		} catch (err) {
			const mailto = `mailto:${recipient || ''}?subject=${encodeURIComponent('Contact via School Directory')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nAddress: ${address}\n\n${message}`)}`;
			window.location.href = mailto;
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
				<div className="lg:col-span-1 space-y-4">
					<h3 className="text-lg sm:text-xl font-semibold">Contact Information</h3>
					<div className="text-slate-700 space-y-3">
						<div className="flex items-start gap-3">
							<MapPin className="h-5 w-5 text-slate-400 mt-1 flex-shrink-0" />
							<div className="text-sm sm:text-base">{school?.contact.address || 'Address not provided'}</div>
						</div>
						<div className="flex items-start gap-3">
							<Mail className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
							<div className="text-sm sm:text-base break-all">{school?.contact.email || 'Email not provided'}</div>
						</div>
						<div className="flex items-center gap-3">
							<Phone className="h-5 w-5 text-slate-400 flex-shrink-0" />
							<div className="text-sm sm:text-base">{school?.contact.phone || 'Phone not provided'}</div>
						</div>
						<div className="flex items-start gap-3">
							<Globe className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
							<div className="text-sm sm:text-base break-all">{school?.website || 'Website not provided'}</div>
						</div>
					</div>

					<div className="mt-4 sm:mt-6">
						<h4 className="font-semibold mb-2 text-sm sm:text-base">Location Map</h4>
						{mapAddress ? (
							<div className="w-full aspect-video rounded overflow-hidden border">
								<iframe
									title="School location"
									src={mapSrc}
									className="w-full h-full"
									loading="lazy"
								/>
							</div>
						) : (
							<div className="text-xs sm:text-sm text-slate-500">No address available to show map.</div>
						)}
					</div>
				</div>

				<div className="lg:col-span-2">
					<h3 className="text-lg sm:text-xl font-semibold mb-4">Send a Message</h3>
					{error && <div className="mb-3 text-sm sm:text-base text-red-600 p-3 bg-red-50 rounded">{error}</div>}
					{success && <div className="mb-3 text-sm sm:text-base text-emerald-700 p-3 bg-emerald-50 rounded">{success}</div>}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">Your Name</label>
								<input value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded p-2 text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Your Email</label>
								<input value={email} onChange={e => setEmail(e.target.value)} type="email" className="mt-1 block w-full border border-slate-300 rounded p-2 text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">Your Address (optional)</label>
							<input value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded p-2 text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">Message</label>
							<textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="mt-1 block w-full border border-slate-300 rounded p-2 text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-y" required />
						</div>

						<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
							<button type="submit" className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-800 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm sm:text-base font-medium disabled:opacity-50" disabled={loading}>
								{loading ? 'Sending...' : 'Send Message'}
							</button>
							<button type="button" className="text-sm text-slate-600 hover:text-slate-900 transition-colors" onClick={() => { setName(''); setEmail(''); setAddress(school?.contact.address || ''); setMessage(''); setError(null); setSuccess(null); }}>Reset Form</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Contact;




// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { fetchSchoolById } from '../services/api';
// import SchoolHeader from '../components/SchoolHeader';
// import { School } from '../types';
// import { MapPin, Mail, Phone, Globe } from 'lucide-react';

// const SchoolContact: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const [school, setSchool] = useState<School | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);


//   useEffect(() => {
//     const load = async () => {
//       if (!id) return;
//       try {
//         setLoading(true);
//         const data = await fetchSchoolById(id);
//         setSchool(data);
//         setError(null);
//       } catch (err) {
//         setError('Failed to load school');
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [id]);

//   if (loading) return <div className="p-12">Loading...</div>;
//   if (error || !school) return <div className="p-12 text-center text-red-600">{error || 'School not found'}</div>;

//   return (
//     <div>
//       <SchoolHeader school={school} currentTab={'contact'} />
//       <div className="max-w-6xl mx-auto p-6">
//         <div className="bg-white p-6 rounded shadow-sm border">
//           <h2 className="text-2xl font-bold mb-4">Contact {school.name}</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-3 text-slate-700">
//               <div className="flex items-center">
//                 <MapPin className="h-5 w-5 text-slate-400 mr-2" />
//                 <span>{school.address}</span>
//               </div>
//               <div className="flex items-center">
//                 <Mail className="h-5 w-5 text-slate-400 mr-2" />
//                 <span>{school.email}</span>
//               </div>
//               <div className="flex items-center">
//                 <Phone className="h-5 w-5 text-slate-400 mr-2" />
//                 <span>{school.phone}</span>
//               </div>
//               <div className="flex items-center">
//                 <Globe className="h-5 w-5 text-slate-400 mr-2" />
//                 <span>{school.website}</span>
//               </div>
//             </div>
//             <div className="h-64 bg-slate-100 rounded"></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SchoolContact;



