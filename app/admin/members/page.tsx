'use client';

import { useState, useRef, useEffect } from 'react';
import { UserPlus, Upload, XIcon, Edit } from 'lucide-react';
import { MemberType, GenderType } from '@/lib/types';
import toast from 'react-hot-toast';
import TextInput from '@/components/form/TextInput';
import OptionsBox from '@/components/form/OptionsBox';
import Checkbox from '@/components/form/Checkbox';
import Table from '@/components/form/Table';
import Image from 'next/image';

const AdminMemberPage = () => {
  const [members, setMembers] = useState<MemberType[]>([]);
  const [editingMember, setEditingMember] = useState<MemberType | null>(null);

  const [name, setName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gender, setGender] = useState<GenderType>('Annet');
  const [role, setRole] = useState('Medlem');
  const [isCurrent, setIsCurrent] = useState(true);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const roles = ['Leder', 'Medlem'];
  const genders: GenderType[] = ['Mann', 'Kvinne', 'Annet'];
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/admin/member');
        if (response.ok) {
          const data = await response.json();

          data.members.sort((a: MemberType, b: MemberType) =>
            a.year > b.year ? -1 : 1,
          );

          setMembers(data.members);
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Klarte ikke å hente medlemmer: ${error.message}`);
        } else {
          toast.error('Klarte ikke å hente medlemmer');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleEdit = (member: MemberType) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setGender(member.gender);
    setIsCurrent(member.isCurrent);
    setSelectedYear(member.year);
    setImagePreview(member.imageHref);
    setImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('role', role);
    formData.append('gender', gender);
    formData.append('isCurrent', isCurrent.toString());
    formData.append('year', selectedYear.toString());
    if (image) {
      formData.append('image', image);
    }

    try {
      let response;

      if (editingMember) {
        formData.append('id', editingMember.id.toString());
        response = await fetch('/api/admin/member', {
          method: 'PUT',
          body: formData,
        });
      } else {
        response = await fetch('/api/admin/member', {
          method: 'POST',
          body: formData,
        });
      }

      if (response.ok) {
        toast.success(editingMember ? 'Medlem oppdatert' : 'Medlem lagt til!');
        resetForm();

        if (editingMember) {
          const updatedMember = await response.json();
          setMembers(
            members.map((member) =>
              member.id === editingMember.id ? updatedMember.member : member,
            ),
          );
        } else {
          setMembers(
            [...members, (await response.json()).member].sort(
              (a: MemberType, b: MemberType) => (a.year > b.year ? -1 : 1),
            ),
          );
        }

        setEditingMember(null);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to add member: ${error.message}`);
      } else {
        toast.error(
          editingMember
            ? 'Klarte ikke å oppdatere medlem'
            : 'Klarte ikke å legge til medlem',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    const confirmed = window.confirm(
      'Er du sikker på at du vil slette dette medlemmet?',
    );
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch('/api/admin/member', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMembers(members.filter((member) => member.id !== id));
        toast.success('Medlem fjernet!');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to remove member: ${error.message}`);
      } else {
        toast.error('Failed to remove member');
      }
    }
  };

  const resetForm = () => {
    setName('');
    setImage(null);
    setImagePreview(null);
    setRole('');
    setGender('Annet');
    setIsCurrent(true);
    setSelectedYear(currentYear);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const columns = [
    {
      header: 'Navn',
      accessor: 'name' as keyof MemberType,
    },
    {
      header: 'Bilde',
      accessor: 'imageHref' as keyof MemberType,
      renderCell: (member: MemberType) => (
        <Image
          height={50}
          width={50}
          src={member.imageHref}
          alt={member.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      ),
    },
    {
      header: 'Rolle',
      accessor: 'role' as keyof MemberType,
    },
    {
      header: 'Status',
      accessor: 'status' as keyof MemberType,
      renderCell: (member: MemberType) =>
        member.isCurrent ? 'Aktiv' : `(${member.year})`,
    },
  ];

  const tableData = members.map((member) => ({
    ...member,
    status: member.isCurrent ? 'Aktiv' : `(${member.year})`,
  }));

  return (
    <div className="container mx-auto p-4 w-full items-start">
      <h1 className="text-2xl font-bold mb-4">Administrer medlemmer</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <TextInput
          id="name"
          label="Navn"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          required
        />

        <div>
          <div className="flex items-center gap-4 mt-4">
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden"
            />
            {isCurrent && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Upload className="inline-block mr-2 h-4 w-4" />
                Last opp bilde
              </button>
            )}
            {imagePreview && isCurrent && (
              <Image
                src={imagePreview}
                alt="Preview"
                height={40}
                width={40}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
          </div>
        </div>

        <OptionsBox
          label="Rolle"
          value={role}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setRole(e.target.value)
          }
          required
          options={roles.map((role) => ({ value: role, label: role }))}
        />

        <OptionsBox
          label="Kjønn"
          value={gender}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setGender(e.target.value as GenderType)
          }
          required
          options={genders.map((gender) => ({ value: gender, label: gender }))}
        />

        <Checkbox
          id="current-member"
          label="Aktivt medlem"
          checked={isCurrent}
          onChange={(e) => setIsCurrent(e.target.checked)}
        />

        {!isCurrent && (
          <OptionsBox
            label="Aktivt år"
            value={selectedYear.toString()}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            options={years.map((year) => ({
              value: year.toString(),
              label: year.toString(),
            }))}
          />
        )}

        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {editingMember ? (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Oppdater medlem
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Legg til medlem
            </>
          )}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Medlemsliste</h2>
      {isLoading ? (
        <div className=" text-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-y-2 border-onlineyellow mb-4"></div>
            <h2 className="text-2xl font-semibold">Laster inn medlemmer...</h2>
          </div>
        </div>
      ) : (
        <Table
          columns={columns}
          data={tableData}
          renderRowActions={(member: MemberType) => (
            <>
              <button
                onClick={() => handleEdit(member)}
                className="text-blue-500 hover:text-blue-700 mr-2"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleRemove(member.id)}
                className="text-red-500 hover:text-red-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </>
          )}
        />
      )}
    </div>
  );
};

export default AdminMemberPage;
