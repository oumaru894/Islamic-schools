import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSchool, fetchSchoolById, updateSchool } from '../services/api';
import { addGalleryItem, deleteGalleryItem, listPeople, addPerson, updatePerson, deletePerson, addTestimonial } from '../services/api';
import { School, LeadershipMember } from '../types';
import Button from '../components/Button';

const emptyLead = (): LeadershipMember => ({ name: '', title: '', bio: '' });

const AdminManageSchool: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);
  const [addingImage, setAddingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [fileUploading, setFileUploading] = useState(false);

  const [form, setForm] = useState<Omit<School, 'id'>>({
    name: '',
    type: 'ISLAMIC_HIGH_SCHOOL' as any,
    county: 'MONTSERRADO' as any,
    location: '',
    description: '',
    mission: '',
    vision: '',
    founded: new Date().getFullYear(),
    students: 0,
    rating: 4.5,
  image: '',
  heroImage: '',
  logo: '',
    website: '',
    contact: { email: '', phone: '', address: '' },
    features: [],
  leadership: [],
  coreValues: [],
  });

  useEffect(() => {
    if (!id) return setInitialLoading(false);
    (async () => {
      try {
        const school = await fetchSchoolById(id!);
        // map incoming to form shape (omit id)
        const { id: _i, ...rest } = school as any;
        setForm({
          ...rest,
          features: rest.features || [],
          leadership: rest.leadership || [],
          gallery: rest.gallery || [],
          testimonials: rest.testimonials || [],
          coreValues: rest.coreValues || [],
        });
        // load people
        const ppl = await listPeople(id!);
        // attach people into form for local preview
        setForm(prev => ({ ...prev, people: ppl } as any));
      } catch (err: any) {
        setError(err.message || 'Failed to load school');
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [id]);

  function setField<T extends keyof typeof form>(key: T, value: any) {
    setForm(prev => ({ ...prev, [key]: value } as any));
  }

  function setContactField(key: keyof School['contact'], value: string) {
    setForm(prev => ({ ...prev, contact: { ...prev.contact, [key]: value } } as any));
  }

  function toggleFeatureFromString(input: string) {
    const parts = input.split(',').map(s => s.trim()).filter(Boolean);
    setForm(prev => ({ ...prev, features: parts } as any));
  }

  function addLeadership() {
  setForm(prev => ({ ...prev, leadership: [...(prev.leadership || []), emptyLead()] } as any));
  }

  function updateLeadership(idx: number, field: keyof LeadershipMember, value: any) {
    const list = [...(form.leadership || [])];
    list[idx] = { ...list[idx], [field]: value } as LeadershipMember;
    setForm(prev => ({ ...prev, leadership: list } as any));
  }

  function removeLeadership(idx: number) {
    const list = [...(form.leadership || [])];
    list.splice(idx, 1);
    setForm(prev => ({ ...prev, leadership: list } as any));
  }

  // People management handlers
  async function addNewPerson(payload: { name: string; role: string; bio?: string; photo?: string; isAdministrator?: boolean }) {
    setError(null);
    try {
      // if a file input exists, check and upload as DataURL
      const photoInput = (document.getElementById('new-person-photo') as HTMLInputElement | null);
      if (photoInput && photoInput.files && photoInput.files[0]) {
        const f = photoInput.files[0];
        const reader = new FileReader();
        const dataUrl: string = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(f);
        });
        const created = await addPerson(id!, { ...payload, fileData: dataUrl });
        setForm(prev => ({ ...prev, people: [ ...(prev.people || []), created ] } as any));
        return;
      }
      const created = await addPerson(id!, payload);
      setForm(prev => ({ ...prev, people: [ ...(prev.people || []), created ] } as any));
    } catch (err: any) {
      setError(err.message || 'Failed to add person');
    }
  }

  async function savePerson(idx: number) {
    const list = [...(form.people || [])] as any[];
    const p = list[idx];
    if (!p) return;
    setError(null);
    try {
      if (p.id) {
        const updated = await updatePerson(id!, Number(p.id), { name: p.name, role: p.role, bio: p.bio, photo: p.photo, is_administrator: p.isAdministrator });
        list[idx] = updated;
        setForm(prev => ({ ...prev, people: list } as any));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save person');
    }
  }

  async function removePerson(idx: number) {
    const list = [...(form.people || [])] as any[];
    const person = list[idx];
    if (!person) return;
    const prev = [...list];
    // optimistic remove
    list.splice(idx, 1);
    setForm(prevF => ({ ...prevF, people: list } as any));
    try {
      if (person.id) await deletePerson(id!, Number(person.id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete person');
      setForm(prevF => ({ ...prevF, people: prev } as any));
    }
  }

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.location.trim()) return 'Location is required';
    if (!form.contact.email.trim()) return 'Contact email is required';
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      if (id) {
        await updateSchool(id, form as Partial<School>);
        navigate(`/school/${id}`);
      } else {
        const created = await createSchool(form as Omit<School, 'id'>);
        navigate(`/school/${(created as any).id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-12">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Edit School' : 'Add New School'}</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input value={form.name} onChange={e => setField('name', e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select value={form.type as any} onChange={e => setField('type', e.target.value as any)} className="mt-1 block w-full border rounded p-2">
              <option value="ISLAMIC_HIGH_SCHOOL">Islamic High School</option>
              <option value="ISLAMIC_INTEGRATED">Integrated (English/Arabic)</option>
              <option value="ISLAMIC_UNIVERSITY">Islamic University</option>
              <option value="TAHFEEZ">Tahfeez (Quranic Memorization)</option>
              <option value="VOCATIONAL">Vocational</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Location</label>
          <input value={form.location} onChange={e => setField('location', e.target.value)} className="mt-1 block w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">County</label>
          <select value={form.county as any} onChange={e => setField('county', e.target.value as any)} className="mt-1 block w-full border rounded p-2">
            <option value="MONTSERRADO">Montserrado</option>
            <option value="NIMBA">Nimba</option>
            <option value="BONG">Bong</option>
            <option value="GRAND_BASSA">Grand Bassa</option>
            <option value="MARGIBI">Margibi</option>
            <option value="LOFA">Lofa</option>
            <option value="MARYLAND">Maryland</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Short Description</label>
          <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={4} className="mt-1 block w-full border rounded p-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Mission</label>
            <textarea value={form.mission || ''} onChange={e => setField('mission', e.target.value)} rows={3} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Vision</label>
            <textarea value={form.vision || ''} onChange={e => setField('vision', e.target.value)} rows={3} className="mt-1 block w-full border rounded p-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Founded (Year)</label>
            <input type="number" value={form.founded} onChange={e => setField('founded', Number(e.target.value))} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Students</label>
            <input type="number" value={form.students} onChange={e => setField('students', Number(e.target.value))} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Rating</label>
            <input type="number" step="0.1" min={0} max={5} value={form.rating} onChange={e => setField('rating', Number(e.target.value))} className="mt-1 block w-full border rounded p-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">School Image</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files && e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setField('image', reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
                className="block"
              />
              <button type="button" onClick={() => {
                // allow pasting in a URL as fallback
                const url = prompt('Paste image URL');
                if (url) setField('image', url);
              }} className="text-sm text-emerald-700">Use URL</button>
            </div>

            {form.image && (
              <div className="mt-3">
                <div className="w-48 h-32 rounded overflow-hidden border">
                  <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                </div>
                <div className="mt-2">
                  <button type="button" onClick={() => setField('image', '')} className="text-sm text-red-600">Remove image</button>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Website</label>
            <input value={form.website || ''} onChange={e => setField('website', e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Hero Image</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files && e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setField('heroImage', reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
                className="block"
              />
              <button type="button" onClick={() => {
                const url = prompt('Paste hero image URL');
                if (url) setField('heroImage', url);
              }} className="text-sm text-emerald-700">Use URL</button>
            </div>
            {((form as any).heroImage) && (
              <div className="mt-3">
                <div className="w-full h-48 rounded overflow-hidden border">
                  <img src={(form as any).heroImage} alt="hero preview" className="w-full h-full object-cover" />
                </div>
                <div className="mt-2">
                  <button type="button" onClick={() => setField('heroImage', '')} className="text-sm text-red-600">Remove hero</button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Logo</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files && e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setField('logo', reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
                className="block"
              />
              <button type="button" onClick={() => {
                const url = prompt('Paste logo URL');
                if (url) setField('logo', url);
              }} className="text-sm text-emerald-700">Use URL</button>
            </div>
            {((form as any).logo) && (
              <div className="mt-3 flex items-center gap-3">
                <div className="w-24 h-24 rounded overflow-hidden border">
                  <img src={(form as any).logo} alt="logo preview" className="w-full h-full object-contain p-2" />
                </div>
                <div>
                  <button type="button" onClick={() => setField('logo', '')} className="text-sm text-red-600">Remove logo</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded">
          <h4 className="font-semibold mb-2">Theme</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium">Primary Color</label>
              <input type="color" value={form.theme?.primary || '#0ea5a4'} onChange={e => setField('theme', { ...(form.theme || {}), primary: e.target.value })} className="mt-1 block w-24 h-10 border rounded p-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Accent Color</label>
              <input type="color" value={form.theme?.accent || '#7c3aed'} onChange={e => setField('theme', { ...(form.theme || {}), accent: e.target.value })} className="mt-1 block w-24 h-10 border rounded p-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Theme Logo URL</label>
              <input value={form.theme?.logo || ''} onChange={e => setField('theme', { ...(form.theme || {}), logo: e.target.value })} className="mt-1 block w-full border rounded p-2" />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded">
          <h4 className="font-semibold mb-2">Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Email" value={form.contact.email} onChange={e => setContactField('email', e.target.value)} className="border rounded p-2" />
            <input placeholder="Phone" value={form.contact.phone} onChange={e => setContactField('phone', e.target.value)} className="border rounded p-2" />
            <input placeholder="Address" value={form.contact.address} onChange={e => setContactField('address', e.target.value)} className="border rounded p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Features (comma separated)</label>
          <input value={form.features.join(', ')} onChange={e => toggleFeatureFromString(e.target.value)} className="mt-1 block w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Core Values</label>
          <div className="mt-2 flex gap-2 items-center">
            <input placeholder="Add a core value" id="new-core-value" className="flex-1 border rounded p-2" />
            <button type="button" onClick={() => {
              const inp = (document.getElementById('new-core-value') as HTMLInputElement | null);
              const v = inp?.value?.trim();
              if (!v) return setError('Value required');
              setForm(prev => ({ ...prev, coreValues: [ ...(prev.coreValues || []), v ] } as any));
              if (inp) inp.value = '';
            }} className="px-3 py-2 bg-emerald-700 text-white rounded">Add</button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {(form.coreValues || []).map((cv, i) => (
              <div key={i} className="bg-white border rounded px-3 py-1 flex items-center gap-2">
                <span className="text-sm">{cv}</span>
                <button type="button" onClick={() => setForm(prev => ({ ...prev, coreValues: (prev.coreValues || []).filter((_, idx) => idx !== i) } as any))} className="text-xs text-red-600">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Leadership</h4>
          <div className="space-y-3">
            {(form.leadership || []).map((member, idx) => (
              <div key={idx} className="border rounded p-3 bg-white">
                <div className="flex gap-2 mb-2">
                  <input placeholder="Name" value={member.name} onChange={e => updateLeadership(idx, 'name', e.target.value)} className="flex-1 border rounded p-2" />
                  <input placeholder="Title" value={member.title} onChange={e => updateLeadership(idx, 'title', e.target.value)} className="w-48 border rounded p-2" />
                </div>
                <textarea placeholder="Short bio" value={member.bio} onChange={e => updateLeadership(idx, 'bio', e.target.value)} rows={2} className="w-full border rounded p-2" />
                  <div className="flex justify-end mt-2">
                    <button type="button" onClick={() => removeLeadership(idx)} className="text-sm text-red-600">Remove</button>
                  </div>
              </div>
            ))}

            <div>
              <button type="button" onClick={addLeadership} className="text-sm text-emerald-700">+ Add leadership member</button>
            </div>
          </div>
        </div>

        {/* Gallery Preview (read-only) */}
        <div>
          <h4 className="font-semibold mb-2">Gallery</h4>

          <div className="mb-3">
            <div className="flex gap-2 items-center">
              <input placeholder="Image URL" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="border rounded p-2 flex-1" />
              <input placeholder="Caption (optional)" value={newImageCaption} onChange={e => setNewImageCaption(e.target.value)} className="border rounded p-2 w-56" />
              <button type="button" onClick={async () => {
                if (!newImageUrl.trim()) return setError('Image URL required');
                setAddingImage(true);
                setError(null);
                try {
                  const item = await addGalleryItem(id!, { url: newImageUrl.trim(), caption: newImageCaption?.trim() });
                  setForm(prev => ({ ...prev, gallery: [ ...(prev.gallery || []), item ] } as any));
                  setNewImageUrl('');
                  setNewImageCaption('');
                } catch (err: any) {
                  setError(err.message || 'Failed to add image');
                } finally {
                  setAddingImage(false);
                }
              }} className="px-3 py-2 bg-emerald-700 text-white rounded">{addingImage ? 'Adding...' : 'Add'}</button>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium">Or upload a file</label>
              <input type="file" accept="image/*" onChange={async (e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                setFileUploading(true);
                setError(null);
                try {
                  const reader = new FileReader();
                  reader.onload = async () => {
                    const dataUrl = reader.result as string;
                    // optimistic preview: add a temporary gallery item with a negative id
                    const tempId = `temp-${Date.now()}`;
                    const tempItem = { id: tempId, url: dataUrl, caption: newImageCaption || 'Uploading...' };
                    setForm(prev => ({ ...prev, gallery: [ ...(prev.gallery || []), tempItem ] } as any));
                    try {
                      const item = await addGalleryItem(id!, { url: '', fileData: dataUrl, caption: newImageCaption?.trim() });
                      // replace temp item with real item
                      setForm(prev => ({ ...prev, gallery: (prev.gallery || []).map((g: any) => g.id === tempId ? item : g) } as any));
                      setNewImageCaption('');
                    } catch (uploadErr: any) {
                      setError(uploadErr.message || 'Upload failed');
                      // remove temp
                      setForm(prev => ({ ...prev, gallery: (prev.gallery || []).filter((g: any) => g.id !== tempId) } as any));
                    }
                  };
                  reader.readAsDataURL(f);
                } catch (err: any) {
                  setError(err.message || 'Upload failed');
                } finally {
                  setFileUploading(false);
                }
              }} />
              {fileUploading && <div className="text-sm text-gray-600 mt-2">Uploading...</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {form.gallery && form.gallery.length > 0 ? (
              form.gallery.map((img: any) => (
                <div key={img.id} className="rounded overflow-hidden border relative">
                  <img src={img.url} alt={img.caption || 'gallery image'} className="w-full h-28 object-cover" />
                  {img.caption && <div className="p-1 text-xs text-gray-600">{img.caption}</div>}
                  <button onClick={async () => {
                    // optimistic UI remove
                    const prev = form.gallery || [];
                    setForm(p => ({ ...p, gallery: (p.gallery || []).filter((g: any) => g.id !== img.id) } as any));
                    try {
                      await deleteGalleryItem(id!, img.id);
                    } catch (err: any) {
                      setError(err.message || 'Failed to delete image');
                      // rollback
                      setForm(p => ({ ...p, gallery: prev } as any));
                    }
                  }} className="absolute top-2 right-2 bg-white/80 text-red-600 rounded px-2 py-1 text-xs">Delete</button>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600">No gallery images yet.</div>
            )}
          </div>
        </div>
        {/* Testimonials management */}
        <div>
          <h4 className="font-semibold mb-2">Testimonials</h4>
          <div className="mb-3 bg-white p-3 rounded border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input placeholder="Author (e.g. Parent)" className="border p-2 rounded" id="new-testimonial-author" />
              <input placeholder="Title (e.g. Parent, Alumnus)" className="border p-2 rounded" id="new-testimonial-title" />
              <div />
            </div>
            <div className="mt-2">
              <textarea placeholder="Testimonial text" id="new-testimonial-text" className="w-full border p-2 rounded" rows={3} />
            </div>
            <div className="mt-2">
              <button type="button" onClick={async () => {
                const authorInput = (document.getElementById('new-testimonial-author') as HTMLInputElement | null);
                const titleInput = (document.getElementById('new-testimonial-title') as HTMLInputElement | null);
                const textInput = (document.getElementById('new-testimonial-text') as HTMLTextAreaElement | null);
                const author = authorInput?.value?.trim();
                const title = titleInput?.value?.trim();
                const text = textInput?.value?.trim();
                if (!text) return setError('Testimonial text is required');
                setError(null);
                try {
                  const created = await addTestimonial(id!, { author: author || undefined, title: title || undefined, text });
                  setForm(prev => ({ ...prev, testimonials: [ ...(prev.testimonials || []), created ] } as any));
                  if (authorInput) authorInput.value = '';
                  if (titleInput) titleInput.value = '';
                  if (textInput) textInput.value = '';
                } catch (err: any) {
                  setError(err.message || 'Failed to add testimonial');
                }
              }} className="px-3 py-2 bg-emerald-700 text-white rounded">Add Testimonial</button>
            </div>
          </div>

          <div className="space-y-2">
            {(form.testimonials || []).length > 0 ? (
              (form.testimonials || []).map((t: any) => (
                <div key={t.id || `${t.text?.slice(0,10)}`} className="border rounded p-3 bg-white">
                  <p className="text-slate-700">{t.text}</p>
                  <div className="mt-2 text-sm text-slate-600">{t.author} {t.title ? `• ${t.title}` : ''}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600">No testimonials yet.</div>
            )}
          </div>
        </div>

        {/* People (staff/administrators) */}
        <div>
          <h4 className="font-semibold mb-2">Administrators / People</h4>

          {/* Add new person form */}
          <div className="mb-3 bg-white p-3 rounded border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input placeholder="Name" className="border p-2 rounded" id="new-person-name" />
              <input placeholder="Role (e.g. Principal)" className="border p-2 rounded" id="new-person-role" />
              <div className="flex items-center gap-2">
                <label className="text-sm">Administrator?</label>
                <input type="checkbox" id="new-person-admin" />
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm">Photo</label>
              <input type="file" accept="image/*" id="new-person-photo" />
            </div>
            <div className="mt-2">
              <button type="button" onClick={async () => {
                const nameInput = (document.getElementById('new-person-name') as HTMLInputElement);
                const roleInput = (document.getElementById('new-person-role') as HTMLInputElement);
                const adminInput = (document.getElementById('new-person-admin') as HTMLInputElement);
                const name = nameInput?.value?.trim();
                const role = roleInput?.value?.trim();
                const isAdmin = adminInput?.checked;
                if (!name || !role) return setError('Name and role required');
                await addNewPerson({ name, role, isAdministrator: isAdmin });
                if (nameInput) nameInput.value = '';
                if (roleInput) roleInput.value = '';
                if (adminInput) adminInput.checked = false;
              }} className="px-3 py-2 bg-emerald-700 text-white rounded">Add Person</button>
            </div>
          </div>

          <div className="space-y-2">
            {(form.people || []).length > 0 ? (
              (form.people || []).map((p: any, i: number) => (
                <div key={p.id || `p-${i}`} className="border rounded p-3 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-20 rounded overflow-hidden bg-gray-100">
                          { (p.image || p.photo) ? (
                            <img src={p.image || p.photo} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No image</div>
                          )}
                        </div>
                      </div>
                      <input value={p.name || ''} onChange={e => setForm(prev => ({ ...prev, people: (prev.people || []).map((x: any, idx: number) => idx === i ? { ...x, name: e.target.value } : x) } as any))} className="border p-2 rounded" />
                      <input value={p.role || ''} onChange={e => setForm(prev => ({ ...prev, people: (prev.people || []).map((x: any, idx: number) => idx === i ? { ...x, role: e.target.value } : x) } as any))} className="border p-2 rounded" />
                      <input value={p.bio || ''} onChange={e => setForm(prev => ({ ...prev, people: (prev.people || []).map((x: any, idx: number) => idx === i ? { ...x, bio: e.target.value } : x) } as any))} className="border p-2 rounded" placeholder="Short bio" />
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => savePerson(i)} className="text-sm text-emerald-700">Save</button>
                      <button type="button" onClick={() => removePerson(i)} className="text-sm text-red-600">Delete</button>
                    </div>
                          </div>
              ))
            ) : (
              <div className="text-sm text-gray-600">No people listed yet.</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" isLoading={loading}>{id ? 'Save Changes' : 'Create School'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate(id ? `/school/${id}` : '/schools')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default AdminManageSchool;
